# strapi-plugin-lexical

> Integrates the [Lexical WYSIWYG editor](https://lexical.dev/) as a custom field in Strapi. Basically a port of [Lexical playground](https://playground.lexical.dev/) into strapi environment with some nice extras.

![screenshot-lexical](https://github.com/user-attachments/assets/e861401d-c850-404f-a5c0-9c6bee0a8456)

[![https://nodei.co/npm/strapi-plugin-lexical.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/strapi-plugin-lexical.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/strapi-plugin-lexical)

> **Alpha Software**  
> This plugin is in active development. Contributions in the form of bug reports, feature suggestions, and pull requests are highly encouraged!
<details>
<summary>Table of contents</summary>

<!-- TOC -->

- [strapi-plugin-lexical](#strapi-plugin-lexical)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Handling Media and Internal Links](#handling-media-and-internal-links)
      - [Opt-in Mechanism](#opt-in-mechanism)
      - [Integration in Lexical documents](#integration-in-lexical-documents)
        - [Media References](#media-references)
        - [Internal Links](#internal-links)
      - [Rendering Strapi media and links](#rendering-strapi-media-and-links)
        - [Fetch while rendering](#fetch-while-rendering)
        - [Prefetch and inject for rendering](#prefetch-and-inject-for-rendering)
  - [Roadmap](#roadmap)
    - [v0 - Alpha](#v0---alpha)
    - [v1 - Stable](#v1---stable)
  - [Contributing](#contributing)
  - [Resources](#resources)
    - [🛠️ Sponsored by hashbite.net | support \& custom development available](#️-sponsored-by-hashbitenet--support--custom-development-available)

<!-- /TOC -->

</details>

## Installation

1. Install the plugin:

    ```bash
    npm install strapi-plugin-lexical
    ```

2. Enable the plugin:

    ```javascript
    // ./config/plugins.js
    {
      lexical: {
        enabled: true,
      },
    };
    ```

3. Include the required CSS and Prism.js in your Strapi admin:

    ```javascript
    // ./src/admin/app.js
    import "strapi-plugin-lexical/style.css";
    import "prismjs";
    ```

4. Add Vite support for Prism.js:
    - Install the plugin:

      ```bash
      npm install --save-dev vite-plugin-prismjs
      ```

    - Update your Vite configuration:

      ```javascript
      // ./src/admin/vite.config.js
      import { mergeConfig } from "vite";
      import prismjs from "vite-plugin-prismjs";

      export default (config) =>
        mergeConfig(config, {
          plugins: [
            prismjs({
              languages: "all", // Load all languages or customize as needed
            }),
          ],
        });
      ```

    > **Note:** Prism.js is required even if you don't plan to support code blocks. If you find a workaround to avoid this, please share it with us via a pull request or issue. We happily skip this installation step if we can!

## Usage

- A new **Lexical** custom field type will be available in the Strapi content-type builder.
- Currently, it supports features migrated from the [Lexical playground](https://playground.lexical.dev/).
- For rendering content on your frontend, consider using libraries like [payload-lexical-react-renderer](https://github.com/atelierdisko/payload-lexical-react-renderer) or similar tools.

### Handling Media and Internal Links

This plugin ensures reliable rendering of images and internal links by maintaining relationships between rich text content and referenced entities. By using a regular media field and **automatically generated or your own link components** we can ensure that all referenced media and internal links are readily available for your frontend, always reflecting the latest data.

> **Important:** This is readme section is WIP. We will update this soon and give better examples on how to query and render images and links

#### Opt-in Mechanism  

To enable this feature, you have to create **secondary fields**:

- With the suffix **`Media`** (e.G. `YourFieldNameMedia`): This field must be a multiple media field with editing disabled.
- With the suffix **`Links`** (e.G. `YourFieldNameLinks`): This must be a component, either use our pregenerated `Links` component or build your own. Important: It should only contain relation fields and the field name must match the linked collection name.

#### Integration in Lexical documents

Media is stored as a custom Lexical nodes, while store relations to strapi content with a custom URL format for links. These are automatically parsed and extracted into the fields you created above.

##### Media References

- Images are stored as **`strapi-image`** node in Lexical.
- Other file types are planned but not yet supported.
- The structure is rather simple, as you can see:

**strapi-image Lexical Node Data Structure:**

```json
{ "documentId": "id_of_media_asset" }
```

##### Internal Links

- Internal links are stored using the regular **`link`** node in Lexical.
- The URL follows the format:  
  `strapi://collectionName/documentId`
  
  This ensures that even if a page’s slug changes, links remain valid.

#### Rendering Strapi media and links

There are two options:

##### Fetch while rendering

@todo

Benefit: Less code, multiple API calls while rendering

- adjust the rendering functions of each lexical node
- actually.. can it even be asnyc? double check... this is the `not recommended way` anyways...

**Example: Fetching the Latest API Data for a link**

```js
const [collectionName, documentId] = linkNode.url.replace("strapi://", "").split("/");
const articles = client.collection(collectionName);
const singleArticle = await articles.findOne(documentId);
// your link generation logic here ...
return `/${singleArticle.locale}/blog/${singleArticle.slug}`
```

##### Prefetch and inject for rendering

@todo

To render media and links, we have to query the data from our media field and fields within the link component, then inject the data into our rendering process.

Benefit: only one API call, more control

- fetch fields
- iterate through the lexical document
- inject the document from the strapi api response into the lexical node for later rendering
- the data is now available when rendering the lexical node in your renderer

**Example Renderer with NextJS:**

```tsx
// LexicalRenderer.tsx
import Image from "next/image";
import Link from "next/link";

import type { Media_Plain } from "@strapi/common/schemas-to-ts/Media";
import { Links_Plain } from "@strapi/components/links/interfaces/Links";

import React from "react";

import clsx from "clsx/lite";

import { createPath } from "@/utils/paths";

import type {
  AbstractNode,
  ElementRenderer,
  ElementRenderers,
  Node,
  PayloadLexicalReactRendererContent,
} from "lexical-renderer-atelier-disko";
import {
  defaultElementRenderers,
  PayloadLexicalReactRenderer,
} from "lexical-renderer-atelier-disko";

type StrapiImageNode = {
  documentId: string;
  entity: Media_Plain;
} & AbstractNode<"strapi-image">;

type NodeAll = Node | StrapiImageNode;

const elementRenderers: ElementRenderers & {
  "strapi-image": ElementRenderer<StrapiImageNode>;
} = {
  ...defaultElementRenderers,
  // Define your custom lexical nodes here
  link: (element, children, parent, className) => (
    <Link
      href={element.url}
      className={className}
      target={element.newTab ? "_blank" : "_self"}
    >
      {children}
    </Link>
  ),
  "strapi-image": (element, children, parent, className) => (
    <Image
      className={clsx("mx-auto", className)}
      src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${element.entity.url}`}
      alt={element.entity.alternativeText}
      width={Math.floor(element.entity.width / 2)}
      height={Math.floor(element.entity.height / 2)}
      sizes={`(max-width: 768px) 100vw, ${Math.floor(
        (element.entity.width / 2) * 1.25
      )}px`}
      loading="lazy"
    />
  ),
};

export function LexicalRenderer({
  children,
  classNames,
  media,
  links,
}: {
  children: PayloadLexicalReactRendererContent;
  classNames?: { [key: string]: string };
  media?: Media_Plain[];
  links?: Links_Plain;
}) {
  // Inject media and links into our lexical document
  const injectedDocument = React.useMemo(() => {
    if (!children) {
      return null;
    }

    if (media || links) {
      const injectStrapiEntities = (nodes: NodeAll[]) => {
        for (const node of nodes) {
          // Media (Images only for now)
          if (node.type === "strapi-image" && media?.length) {
            const foundMedia = media.find(
              // @ts-expect-error documentId is there. the ts schema plugin is just outdated :(
              ({ documentId }) => documentId === node.documentId
            );
            if (foundMedia) {
              node.entity = foundMedia;
            }
          }

          // Links
          if (
            node.type === "link" &&
            links &&
            node.url.indexOf("strapi://") === 0
          ) {
            // Extract info from strapi link
            const [collectionName, linkDocumentId] = (node.url as string)
              .replace("strapi://", "")
              .split("/") as [keyof Links_Plain, string];
            if (links[collectionName]) {
              // Find linked document
              const foundCollectionDocument = links[collectionName].find(
                ({ documentId }) => documentId === linkDocumentId
              );
              if (foundCollectionDocument) {
                // Generate page link with helper function
                node.url = createPath(
                  collectionName,
                  foundCollectionDocument.locale,
                  foundCollectionDocument.slug
                );
              }
            }
          }
          if (node.type !== "strapi-image" && node.children) {
            injectStrapiEntities(node.children);
          }
        }
      };

      injectStrapiEntities(children.root.children);
    }

    return children;
  }, [children, media, links]);

  if (!children || !injectedDocument) {
    return null;
  }

  return (
    <PayloadLexicalReactRenderer
      content={injectedDocument}
      classNames={classNames}
      elementRenderers={elementRenderers}
    />
  );
}

export const lexicalToPlaintext = (json: { root: Node }) => {
  const traverse = (node: Node): string => {
    if (node.type === "text" && node.text) return node.text;
    if (node.children) return node.children.map(traverse).join(" ");
    return "";
  };
  return traverse(json.root);
};
```

## Roadmap

### v0 - Alpha

- [x] Implement basic functionality.
- [x] Port features from the Lexical playground as the initial foundation.
- [x] Integrate Strapi Media Assets and enable linking to Strapi Collection Entries
- [ ] Create field presets:
  - **Simple**, **Complex**, and **Full** (selectable during field setup).
- [ ] Gather community feedback.
- [ ] Look for a potential co-maintainer.

### v1 - Stable

- Introduce plugin-based architecture:
  - Allow users to extend functionality with their own plugins.
- Enable configuration of presets via plugin settings.
- Open to community ideas! [Submit an issue](https://github.com/hashbite/strapi-plugin-lexical/issues).

---

## Contributing

We welcome contributions! Here’s how you can help:

- Report bugs or suggest features via the [issue tracker](https://github.com/hashbite/strapi-plugin-lexical/issues).
- Submit pull requests to improve functionality or documentation.
- Share your feedback and ideas to shape the plugin’s future.

---

## Resources

- [Lexical Documentation](https://lexical.dev/docs)
- [Lexical Playground](https://playground.lexical.dev/)
- [Payload Lexical React Renderer](https://github.com/atelierdisko/payload-lexical-react-renderer)
- [Strapi Plugin Development Guide](https://docs.strapi.io/developer-docs/latest/plugin-development/introduction.html)

---

### 🛠️ Sponsored by [hashbite.net](https://hashbite.net) | support & custom development available

We welcome everyone to post issues, fork the project, and contribute via pull requests. Together we can make this a better tool for all of us!

If the contribution process feels too slow or complex for your needs, [hashbite.net](https://hashbite.net) can quickly implement features, fix bugs, or develop custom variations of this plugin on a paid basis. Just reach out through their website for direct support.
