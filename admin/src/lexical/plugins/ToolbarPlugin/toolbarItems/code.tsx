import { useIntl } from 'react-intl';
import { ToolbarItemProps } from '../../../../supportedNodeTypes';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { SHORTCUTS } from '../../ShortcutsPlugin/shortcuts';

export function Code({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();
  const canViewerSeeInsertCodeButton = !toolbarState.isImageCaption;

  return (
    canViewerSeeInsertCodeButton && (
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
        }}
        className={'toolbar-item spaced ' + (toolbarState.isCode ? 'active' : '')}
        title={formatMessage(
          {
            id: 'lexical.plugin.toolbar.format.code.title',
            defaultMessage: 'Insert code block ({shortcut})',
          },
          { shortcut: SHORTCUTS.INSERT_CODE_BLOCK }
        )}
        type="button"
        aria-label={formatMessage({
          id: 'lexical.plugin.toolbar.format.code.aria',
          defaultMessage: 'Insert code block',
        })}
      >
        <i className="format code" />
      </button>
    )
  );
}
