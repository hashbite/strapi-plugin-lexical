import { StrapiApp } from '@strapi/strapi/admin';
import { Initializer } from './components/Initializer';
import { LexicalIcon } from './components/LexicalIcon';
import { PLUGIN_ID } from './pluginId';

import { supportedNodeTypes } from './supportedNodeTypes';
import { defaultStrapiFieldConfig } from './lexical/context/StrapiFieldContext';

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
        advanced: [
          {
            sectionTitle: {
              id: 'lexical.nodeTypes.section.enabled',
              defaultMessage: 'Select the node types to enable',
            },
            items: Object.values(supportedNodeTypes).map((supportedNodeType) => ({
              intlLabel: {
                id: `lexical.supportedNodeTypes.${supportedNodeType.id}.label`,
                defaultMessage: supportedNodeType.defaultLabel,
              },
              type: 'checkbox',
              description: {
                id: `lexical.supportedNodeTypes.${supportedNodeType.id}.description`,
                defaultMessage: supportedNodeType.defaultDescription,
              },
              // Current strapi types do not reflect the possibility
              // to store custom configuration names, but code does.
              name: `options.enabledNodeTypes.${supportedNodeType.id}` as any,
              defaultValue: supportedNodeType.enabledByDefault,
            })),
          },
          {
            sectionTitle: {
              id: 'lexical.fontSize.section.feature',
              defaultMessage: 'Font size feature',
            },
            items: [
              {
                intlLabel: {
                  id: `lexical.fontSize.enabled.label`,
                  defaultMessage: 'Enable font size feature',
                },
                type: 'checkbox',
                defaultValue: defaultStrapiFieldConfig.fontSize.enabled,
                description: {
                  id: `lexical.fontSize.enabled.description`,
                  defaultMessage: 'Enable users to change font size',
                },
                name: `options.fontSize.enabled`,
              },
              {
                intlLabel: {
                  id: `lexical.fontSize.default.label`,
                  defaultMessage: 'Default font size',
                },
                type: 'number',
                defaultValue: defaultStrapiFieldConfig.fontSize.default,
                description: {
                  id: `lexical.fontSize.default.description`,
                  defaultMessage: 'Default font size size of your editor',
                },
                name: `options.fontSize.default`,
              },
              {
                intlLabel: {
                  id: `lexical.fontSize.minimum.label`,
                  defaultMessage: 'Minimum font size',
                },
                type: 'number',
                defaultValue: defaultStrapiFieldConfig.fontSize.minimum,
                description: {
                  id: `lexical.fontSize.minimum.description`,
                  defaultMessage: 'Minimum font size size of your editor',
                },
                name: `options.fontSize.minimum`,
              },
              {
                intlLabel: {
                  id: `lexical.fontSize.maximum.label`,
                  defaultMessage: 'Maximum font size',
                },
                type: 'number',
                defaultValue: defaultStrapiFieldConfig.fontSize.maximum,
                description: {
                  id: `lexical.fontSize.maximum.description`,
                  defaultMessage: 'Maximum font size size of your editor',
                },
                name: `options.fontSize.maximum`,
              },
            ],
          },
          {
            sectionTitle: {
              id: 'lexical.fontFamily.section.feature',
              defaultMessage: 'Font family feature',
            },
            items: [
              {
                intlLabel: {
                  id: `lexical.fontFamily.enabled.label`,
                  defaultMessage: 'Enable font family feature',
                },
                type: 'checkbox',
                defaultValue: defaultStrapiFieldConfig.fontFamily.enabled,
                description: {
                  id: `lexical.fontFamily.enabled.description`,
                  defaultMessage: 'Enable users to change font family',
                },
                name: `options.fontFamily.enabled`,
              },
              {
                intlLabel: {
                  id: `lexical.fontFamily.families.label`,
                  defaultMessage: 'Enabled font families',
                },
                type: 'text',
                defaultValue: defaultStrapiFieldConfig.fontFamily.families,
                description: {
                  id: `lexical.fontFamily.default.description`,
                  defaultMessage: 'Enabled font families. Separated by semi-colon (;)',
                },
                name: `options.fontFamily.families`,
              },
            ],
          },
          {
            sectionTitle: {
              id: 'lexical.actions.section.enabled',
              defaultMessage: 'Select actions to enable',
            },
            items: [
              {
                intlLabel: {
                  id: `lexical.actions.sessionHistory.label`,
                  defaultMessage: 'Session history',
                },
                type: 'checkbox',
                description: {
                  id: `lexical.actions.sessionHistory.description`,
                  defaultMessage: 'Add buttons to undo/redo within the current editing session',
                },
                name: `options.enabledActions.sessionHistory`,
                defaultValue: defaultStrapiFieldConfig.enabledActions.sessionHistory,
              },
              {
                intlLabel: {
                  id: `lexical.actions.clear.label`,
                  defaultMessage: 'Clear',
                },
                type: 'checkbox',
                description: {
                  id: `lexical.actions.clear.description`,
                  defaultMessage: 'Add button to clear all text within the current editor',
                },
                name: `options.enabledActions.clear`,
                defaultValue: defaultStrapiFieldConfig.enabledActions.clear,
              },
              {
                intlLabel: {
                  id: `lexical.actions.exportAsMarkdown.label`,
                  defaultMessage: 'Export as Markdown',
                },
                type: 'checkbox',
                description: {
                  id: `lexical.actions.exportAsMarkdown.description`,
                  defaultMessage: 'Add button to export editor text in Markdown format',
                },
                name: `options.enabledActions.exportAsMarkdown`,
                defaultValue: defaultStrapiFieldConfig.enabledActions.exportAsMarkdown,
              },
              {
                intlLabel: {
                  id: `lexical.actions.import.label`,
                  defaultMessage: 'Import',
                },
                type: 'checkbox',
                description: {
                  id: `lexical.actions.import.description`,
                  defaultMessage: 'Add button to import existing Lexical-formatted text',
                },
                name: `options.enabledActions.import`,
                defaultValue: defaultStrapiFieldConfig.enabledActions.import,
              },
              {
                intlLabel: {
                  id: `lexical.actions.export.label`,
                  defaultMessage: 'Export',
                },
                type: 'checkbox',
                description: {
                  id: `lexical.actions.export.description`,
                  defaultMessage: 'Add button to export text in Lexical format',
                },
                name: `options.enabledActions.export`,
                defaultValue: defaultStrapiFieldConfig.enabledActions.export,
              },
            ],
          },
          {
            sectionTitle: {
              id: 'lexical.developers.section.enabled',
              defaultMessage: 'Select developer settings to enable',
            },
            items: [
              {
                intlLabel: {
                  id: `lexical.developers.treeView.label`,
                  defaultMessage: 'Tree view',
                },
                type: 'checkbox',
                description: {
                  id: `lexical.developers.treeView.description`,
                  defaultMessage: 'Add button to show internal Lexical tree',
                },
                name: `options.developers.treeView`,
                defaultValue: defaultStrapiFieldConfig.developers.treeView,
              },
            ],
          },
        ],
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
