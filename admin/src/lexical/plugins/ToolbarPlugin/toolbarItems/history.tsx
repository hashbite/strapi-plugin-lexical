import { LexicalEditor, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { ToolbarState } from '../../../context/ToolbarContext';
import { useIntl } from 'react-intl';
import { IS_APPLE } from '@lexical/utils';
import { ToolbarItemProps } from '../../../../supportedNodeTypes';

export function HistoryUndo({ toolbarState, activeEditor, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <button
      disabled={!toolbarState.canUndo || !isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
      }}
      title={formatMessage(
        { id: 'lexical.plugin.toolbar.undo.title', defaultMessage: 'Undo ({shortcut})' },
        { shortcut: IS_APPLE ? '⌘Z' : 'Ctrl+Z' }
      )}
      type="button"
      className="toolbar-item spaced"
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.undo.aria',
        defaultMessage: 'Undo',
      })}
    >
      <i className="format undo" />
    </button>
  );
}

export function HistoryRedo({ toolbarState, activeEditor, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <button
      disabled={!toolbarState.canRedo || !isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(REDO_COMMAND, undefined);
      }}
      title={formatMessage(
        { id: 'lexical.plugin.toolbar.redo.title', defaultMessage: 'Redo ({shortcut})' },
        { shortcut: IS_APPLE ? '⇧⌘Z' : 'Ctrl+Y' }
      )}
      type="button"
      className="toolbar-item"
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.redo.aria',
        defaultMessage: 'Redo',
      })}
    >
      <i className="format redo" />
    </button>
  );
}
