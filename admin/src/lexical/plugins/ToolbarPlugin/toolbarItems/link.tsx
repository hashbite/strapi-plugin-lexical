import { useIntl } from 'react-intl';
import { ToolbarItemProps } from '../../../../supportedNodeTypes';
import { SHORTCUTS } from '../../ShortcutsPlugin/shortcuts';
import { useCallback } from 'react';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { sanitizeUrl } from '../../../utils/url';
import { useToolbarItemRenderDependencies } from '../../../context/ToolbarItemRenderDependenciesContext';

export function Link({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();
  const { setIsLinkEditMode } = useToolbarItemRenderDependencies();

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);

  return (
    <button
      disabled={!isEditable}
      onClick={insertLink}
      className={'toolbar-item spaced ' + (toolbarState.isLink ? 'active' : '')}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.insert.link.aria',
        defaultMessage: 'Insert link',
      })}
      title={formatMessage(
        {
          id: 'lexical.plugin.toolbar.insert.link.title',
          defaultMessage: 'Insert link ({shortcut})',
        },
        { shortcut: SHORTCUTS.INSERT_LINK }
      )}
      type="button"
    >
      <i className="format link" />
    </button>
  );
}
