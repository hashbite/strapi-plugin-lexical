import { StrapiApp } from '@strapi/strapi/admin';
import { Initializer } from './components/Initializer';
import { LexicalIcon } from './components/LexicalIcon';
import { PLUGIN_ID } from './pluginId';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });

    app.customFields.register({
      name: 'lexical',
      pluginId: 'lexical',
      type: 'json',
      intlLabel: {
        id: 'lexical.plugin.label',
        defaultMessage: 'Lexical Editor',
      },
      intlDescription: {
        id: 'lexical.plugin.description',
        defaultMessage: 'Lexical advanced WYSIWYG editor',
      },
      icon: LexicalIcon,
      components: {
        Input: async () =>
          // @ts-expect-error its fine and works, the typing of the props seems to be wrong at the moment
          import(/* webpackChunkName: "lexical-input-component" */ './components/Input'),
      },
      options: {
        // declare options here
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
