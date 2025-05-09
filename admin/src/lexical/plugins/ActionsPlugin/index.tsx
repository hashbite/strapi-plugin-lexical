/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalEditor } from 'lexical';
import type { JSX } from 'react';

import { $createCodeNode, $isCodeNode } from '@lexical/code';
import {
  editorStateFromSerializedDocument,
  exportFile,
  importFile,
  SerializedDocument,
  serializedDocumentFromEditorState,
} from '@lexical/file';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { useCollaborationContext } from '@lexical/react/LexicalCollaborationContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import useFlashMessage from '../../hooks/useFlashMessage';
import useModal from '../../hooks/useModal';
import Button from '../../ui/Button';
import { docFromHash, docToHash } from '../../utils/docSerialization';
import { PLAYGROUND_TRANSFORMERS } from '../MarkdownTransformers';
import { useStrapiFieldContext } from '../../context/StrapiFieldContext';

async function sendEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  try {
    await fetch('http://localhost:1235/setEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  let response = null;
  try {
    response = await fetch('http://localhost:1235/validateEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error('Editor state validation failed! Server did not accept changes.');
  }
}

async function shareDoc(doc: SerializedDocument): Promise<void> {
  const url = new URL(window.location.toString());
  url.hash = await docToHash(doc);
  const newUrl = url.toString();
  window.history.replaceState({}, '', newUrl);
  await window.navigator.clipboard.writeText(newUrl);
}

export default function ActionsPlugin({
  isRichText,
  shouldPreserveNewLinesInMarkdown,
}: {
  isRichText: boolean;
  shouldPreserveNewLinesInMarkdown: boolean;
}): JSX.Element {
  const { formatMessage } = useIntl();
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [modal, showModal] = useModal();
  const showFlashMessage = useFlashMessage();

  useEffect(() => {
    docFromHash(window.location.hash).then((doc) => {
      if (doc && doc.source === 'Playground') {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, prevEditorState, tags }) => {
      // If we are in read only mode, send the editor state
      // to server and ask for validation if possible.
      if (
        !isEditable &&
        dirtyElements.size > 0 &&
        !tags.has('historic') &&
        !tags.has('collaboration')
      ) {
        validateEditorState(editor);
      }
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        if (children.length > 1) {
          setIsEditorEmpty(false);
        } else {
          if ($isParagraphNode(children[0])) {
            const paragraphChildren = children[0].getChildren();
            setIsEditorEmpty(paragraphChildren.length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        }
      });
    });
  }, [editor, isEditable]);

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          PLAYGROUND_TRANSFORMERS,
          undefined, // node
          shouldPreserveNewLinesInMarkdown
        );
      } else {
        const markdown = $convertToMarkdownString(
          PLAYGROUND_TRANSFORMERS,
          undefined, //node
          shouldPreserveNewLinesInMarkdown
        );
        const codeNode = $createCodeNode('markdown');
        codeNode.append($createTextNode(markdown));
        root.clear().append(codeNode);
        if (markdown.length === 0) {
          codeNode.select();
        }
      }
    });
  }, [editor, shouldPreserveNewLinesInMarkdown]);

  const strapiFieldConfig = useStrapiFieldContext();

  return (
    <div className="actions">
      {strapiFieldConfig.enabledActions.import && (
        <button
          className="action-button import"
          onClick={() => importFile(editor)}
          title={formatMessage({
            id: 'lexical.plugin.actions.import.title',
            defaultMessage: 'Import',
          })}
          aria-label={formatMessage({
            id: 'lexical.plugin.actions.import.aria',
            defaultMessage: 'Import editor state from JSON',
          })}
        >
          <i className="import" />
        </button>
      )}

      {strapiFieldConfig.enabledActions.export && (
        <button
          className="action-button export"
          onClick={() =>
            exportFile(editor, {
              fileName: formatMessage(
                {
                  id: 'lexical.plugin.actions.export.filename',
                  defaultMessage: 'Playground {date}',
                },
                { date: new Date().toISOString() }
              ),
              source: 'Playground',
            })
          }
          title={formatMessage({
            id: 'lexical.plugin.actions.export.title',
            defaultMessage: 'Export',
          })}
          aria-label={formatMessage({
            id: 'lexical.plugin.actions.export.aria',
            defaultMessage: 'Export editor state to JSON',
          })}
        >
          <i className="export" />
        </button>
      )}
      {strapiFieldConfig.enabledActions.clear && (
        <button
          className="action-button clear"
          disabled={isEditorEmpty}
          onClick={() => {
            showModal(
              formatMessage({
                id: 'lexical.plugin.actions.clear.modal.title',
                defaultMessage: 'Clear editor',
              }),
              (onClose) => <ShowClearDialog editor={editor} onClose={onClose} />
            );
          }}
          title={formatMessage({
            id: 'lexical.plugin.actions.clear.title',
            defaultMessage: 'Clear',
          })}
          aria-label={formatMessage({
            id: 'lexical.plugin.actions.clear.aria',
            defaultMessage: 'Clear editor contents',
          })}
        >
          <i className="clear" />
        </button>
      )}
      {strapiFieldConfig.enabledActions.exportAsMarkdown && (
        <button
          className="action-button"
          onClick={handleMarkdownToggle}
          title={formatMessage({
            id: 'lexical.plugin.actions.markdown.title',
            defaultMessage: 'Convert From Markdown',
          })}
          aria-label={formatMessage({
            id: 'lexical.plugin.actions.markdown.aria',
            defaultMessage: 'Convert from markdown',
          })}
        >
          <i className="markdown" />
        </button>
      )}
      {modal}
    </div>
  );
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const { formatMessage } = useIntl();
  return (
    <>
      {formatMessage({
        id: 'lexical.plugin.actions.clear.confirm',
        defaultMessage: 'Are you sure you want to clear the editor?',
      })}
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
          }}
        >
          {formatMessage({ id: 'lexical.plugin.actions.clear.button', defaultMessage: 'Clear' })}
        </Button>{' '}
        <Button
          onClick={() => {
            editor.focus();
            onClose();
          }}
        >
          {formatMessage({ id: 'lexical.plugin.actions.cancel', defaultMessage: 'Cancel' })}
        </Button>
      </div>
    </>
  );
}
