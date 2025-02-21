import type { Core, Struct } from '@strapi/strapi';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Retrieve all API content types (excluding core types like users-permissions)
  const contentTypes = Object.entries(strapi.contentTypes)
    .filter(([uid]) => uid.startsWith('api::')) // Only user-defined content types
    .map(([uid]) => uid);

  const attributes: { [key: string]: { type: string; relation: string; target: string } } = {};

  for (const contentTypeUID of contentTypes) {
    const contentType = strapi.contentTypes[contentTypeUID];

    if (contentType) {
      attributes[contentType.collectionName] = {
        type: 'relation',
        relation: 'oneToMany',
        target: contentTypeUID,
      };
    }
  }

  // Create default links component
  const linksComponentUID: `${string}.${string}` = `links.links`;
  const linksComponentSchema: Partial<Struct.ComponentSchema> = {
    category: 'links',
    // @ts-expect-error yes, its there, and required. types seem to be wrong
    displayName: 'Links',
    uid: linksComponentUID,
    info: {
      displayName: 'Links',
      description: `Component linking to all collection types by default`,
      icon: 'link',
    },
    attributes: attributes as any,
  };

  const existingComponents = Object.keys(strapi.components);
  if (!existingComponents.includes(linksComponentUID)) {
    strapi.log.info(`Lexical: Creating default links component: ${linksComponentUID}`);
    await strapi
      .plugin('content-type-builder')
      .services.components.createComponent({ component: linksComponentSchema });
  }
};

export default bootstrap;
