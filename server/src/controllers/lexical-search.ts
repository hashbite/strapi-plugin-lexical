import type { Core } from '@strapi/strapi';

import querystring from 'node:querystring';

// turns "companies" into "api::company:company"
function findCollectionUID(strapi: Core.Strapi, collectionName: string) {
  const realCollectionName = collectionName.replace(/[- ]/g, '_');
  const found = Object.entries(strapi.contentTypes).find(([, collectionType]) => {
    return collectionType.collectionName === realCollectionName;
  });
  if (!found) {
    throw new Error(`Collection ${realCollectionName} not found`);
  }
  return found[0];
}

// @todo this is just a quick workaround, we probably should allow the user to configure which fields can be searched
// we could do it similar to strapi-plugin-fuzzy-search or even integrate with the plugin itself (might be problematic?)
function findTitleField(strapi: Core.Strapi, collectionTypeUID) {
  const contentType = strapi.contentTypes[collectionTypeUID];
  return Object.keys(contentType.attributes).find((fieldName) =>
    ['name', 'title', 'label', 'headline'].includes(fieldName)
  );
}

const lexicalSearch = ({ strapi }: { strapi: Core.Strapi }) => ({
  async search(ctx) {
    // @todo Reenable filtered search, either by config or by automatic detection of which link fields are available.
    // this got removed this was problematic with data structures that have sub components, the following code wont work with them:
    // const { model, field } = ctx.params;

    // const contentType = strapi.contentTypes[model];
    // const linksField = contentType.attributes[`${field}Links`];

    // console.dir({contentType}, {depth: null})
    // if (!linksField) {
    //   console.log('No links field found');
    //   ctx.body = [];
    //   return;
    // }

    // const linkableComponents = linksField.components
    //   .filter((component: string) => component !== 'lexical-links.media')
    //   .map((component: string) => {
    //     const collectionName = component.replace('lexical-links.', '');
    //     return findCollectionUID(strapi, collectionName);
    //   });

    // Retrieve all API content types (excluding core types like users-permissions)
    const contentTypes = Object.entries(strapi.contentTypes)
      .filter(([uid]) => uid.startsWith('api::')) // Only user-defined content types
      .map(([uid]) => uid);

    const qs = querystring.parse(ctx.url.split('?')[1]);

    const results: {
      documentId: string;
      collectionName: string;
      id: number;
      label: string;
    }[] = [];

    for (const contentType of contentTypes) {
      const fieldName = findTitleField(strapi, contentType);

      if (fieldName) {
        const query = {
          locale: qs.locale,
          filters: {
            [fieldName]: {
              $contains: qs.q,
            },
          },
        };
        const res = await strapi.documents(contentType as any).findMany(query);

        if (res.length) {
          const { collectionName } = strapi.contentType(contentType as any);
          for (const entity of res) {
            results.push({
              documentId: entity.documentId,
              id: entity.id,
              label: entity[fieldName],
              collectionName,
            });
          }
        }
      }
    }

    ctx.body = JSON.stringify(results, null, 2);
  },
  // get a single result so we can preview the currently selected item
  async get(ctx) {
    const { collectionName, documentId } = ctx.params;
    const collectionUID = findCollectionUID(strapi, collectionName);
    const entity = await strapi.documents(collectionUID as any).findOne({ documentId });
    const fieldName = findTitleField(strapi, collectionUID);
    ctx.body = JSON.stringify(
      { documentId: entity.documentId, id: entity.id, label: entity[fieldName], collectionName },
      null,
      2
    );
  },
  // Take api plural url and turn it into api identifies
  // @todo i bet strapi can do that and i am too dump?
  async identify(ctx) {
    const collectionUID = findCollectionUID(strapi, ctx.params.collectionName);
    ctx.body = JSON.stringify({ collectionUID });
  },
});

export default lexicalSearch;
