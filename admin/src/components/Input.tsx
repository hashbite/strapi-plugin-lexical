import * as React from 'react';

import { Field, Flex } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { debounce } from 'lodash';
import { useIntl } from 'react-intl';

import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { SerializedEditorState, SerializedElementNode, SerializedLexicalNode } from 'lexical';

import LexicalEditor from '../lexical/Editor';
import { FlashMessageContext } from '../lexical/context/FlashMessageContext';
import { ToolbarContext } from '../lexical/context/ToolbarContext';
import { TableContext } from '../lexical/plugins/TablePlugin';
import PlaygroundEditorTheme from '../lexical/themes/PlaygroundEditorTheme';

import Nodes from '../lexical/nodes';

import { SerializedLinkNode } from '@lexical/link';
import { InputProps } from '@strapi/strapi/admin';
import { SerializedStrapiImageNode } from 'src/lexical/nodes/StrapiImageNode';

interface CustomFieldsComponentProps {
  attribute: {
    type: string;
    customField: string;
  };
  description: MessageDescriptor;
  placeholder: MessageDescriptor;
  onChange: (event: { target: { name: string; value: unknown; type: string } }) => void;
  value: SerializedEditorState<SerializedLexicalNode>;
  error: MessageDescriptor;
}
interface Relation {
  apiData: any;
  label: string;
  id: number;
  status: string;
  href: string;
}

const Input = React.forwardRef<HTMLDivElement, CustomFieldsComponentProps & InputProps>(
  (props, ref) => {
    const { attribute, name, onChange, required, value, error, hint, labelAction, label } = props;
    const { formatMessage } = useIntl();
    const { get } = useFetchClient();

    const handleChange = async (newValue: SerializedEditorState<SerializedLexicalNode>) => {
      // Avoid unnecessary draft/modified status of entry
      if (JSON.stringify(value) === JSON.stringify(newValue)) {
        return;
      }

      // Set value for lexical editor
      onChange({
        target: { name, type: attribute.type, value: newValue },
      });

      // Parse lexical document for images and links
      const mediaNodes = ['strapi-image'];
      const linkNodes = ['link'];

      const mediaDocumentsIds: Set<string> = new Set();
      const collectionLinks: Map<string, Set<string>> = new Map();
      const gatherStrapiRelations = (nodes: SerializedElementNode[]) => {
        for (const node of nodes) {
          if (mediaNodes.includes(node.type)) {
            const imageNode = node as unknown as SerializedStrapiImageNode;
            mediaDocumentsIds.add(imageNode.documentId);
          }

          if (linkNodes.includes(node.type)) {
            const linkNode = node as unknown as SerializedLinkNode;
            if (linkNode.url.indexOf('strapi://') === 0) {
              const [collectionName, documentId] = linkNode.url.replace('strapi://', '').split('/');
              const currentLinksSet: Set<string> = collectionLinks.get(collectionName) || new Set();
              currentLinksSet.add(documentId);
              collectionLinks.set(collectionName, currentLinksSet);
            }
          }

          if (node.children) {
            gatherStrapiRelations(node.children as SerializedElementNode[]);
          }
        }
      };

      gatherStrapiRelations(newValue.root.children as SerializedElementNode[]);

      // Reference media
      if (mediaDocumentsIds.size > 0) {
        try {
          const resultFetchClient = await get(`/upload/files`, {
            params: {
              filters: {
                documentId: {
                  $in: [...mediaDocumentsIds.values()],
                },
              },
              pagination: {
                page: 1,
                pageSize: mediaDocumentsIds.size,
              },
            },
          });
          onChange({
            target: {
              name: `${name}Media`,
              type: 'media',
              value: resultFetchClient.data.results,
            },
          });
        } catch (err) {
          // @todo use strapi alert
          alert(
            formatMessage({
              id: 'lexical.components.input.alert.media-failure',
              defaultMessage:
                'Failed to locate media used in the rich text. This may be due to a permission issue. Please contact your administrator or developer for assistance.',
            })
          );
          console.error(err);
        }
      } else {
        onChange({
          target: {
            name: `${name}Media`,
            type: 'media',
            value: [],
          },
        });
      }

      // Reference collections/links
      try {
        const links: { [key: string]: { connect: Relation[] } } = {};
        for (const [collectionName, documentIds] of collectionLinks.entries()) {
          const resultIdentify = await get(`/lexical/identify/${collectionName}`);
          const resultFetchClient = await get(
            `/content-manager/collection-types/${resultIdentify.data.collectionUID}`,
            {
              params: {
                filters: {
                  documentId: {
                    $in: [...documentIds.values()],
                  },
                },
                pagination: {
                  page: 1,
                  pageSize: documentIds.size,
                },
              },
            }
          );

          links[collectionName] = {
            connect: resultFetchClient.data.results.map(
              (result: { id: number; documentId: string; [key: string]: unknown }) => ({
                apiData: result,
                label: result['name'] || result['title'] || result['label'] || result['headline'],
                id: result.id,
                status: result.status,
                href: `/content-manager/collection-types/${resultIdentify.data.collectionUID}/${result.documentId}`,
              })
            ),
            // @todo we probably have to maintain disconnect array as well to avoid issues on long term. No time right now for that ;)
          };
        }
        onChange({
          target: {
            name: `${name}Links`,
            type: 'component',
            value: links,
          },
        });
      } catch (err) {
        // @todo use strapi alert
        alert(
          formatMessage({
            id: 'lexical.components.input.alert.links-failure',
            defaultMessage:
              'Failed to locate linked collection entries in the rich text. This may be due to a permission issue. Please contact your administrator or developer for assistance.',
          })
        );
        console.error(err);
      }
    };

    const handleChangeCb = React.useCallback(
      debounce(
        async (newValue: SerializedEditorState<SerializedLexicalNode>) => {
          await handleChange(newValue);
        },
        300,
        { maxWait: 1500 }
      ),
      [handleChange]
    );

    const initialConfig = React.useMemo<InitialConfigType>(
      () => ({
        editorState:
          value && value.root && value.root.children.length ? JSON.stringify(value) : undefined,
        namespace: 'Lexical',
        nodes: [...Nodes],
        onError: (error: Error) => {
          throw error;
        },
        theme: PlaygroundEditorTheme,
      }),
      []
    );

    return (
      <Field.Root name={name} id={name} error={error as string} hint={hint} required={required}>
        <Flex direction="column" alignItems="stretch" gap={1}>
          <Field.Label action={labelAction}>{label}</Field.Label>
          <div>
            <FlashMessageContext>
              <LexicalComposer initialConfig={initialConfig}>
                <TableContext>
                  <ToolbarContext>
                    <LexicalEditor onChange={handleChangeCb} ref={ref} fieldName={name} />
                  </ToolbarContext>
                </TableContext>
              </LexicalComposer>
            </FlashMessageContext>
          </div>
          <Field.Hint />
          <Field.Error />
        </Flex>
      </Field.Root>
    );
  }
);

export default Input;
