import { FORMAT_TEXT_COMMAND } from 'lexical';
import { ToolbarItemProps } from '../../../../supportedNodeTypes';
import { useIntl } from 'react-intl';
import { SHORTCUTS } from '../../ShortcutsPlugin/shortcuts';
import { DropDownItem } from '../../../ui/DropDown';
import { dropDownActiveClass, clearFormatting } from '../codeLessUtils';

export function ClearFormatting({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => clearFormatting(activeEditor)}
      className="item wide"
      title={formatMessage({
        id: 'lexical.plugin.toolbar.format.clear.title',
        defaultMessage: 'Clear text formatting',
      })}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.clear.aria',
        defaultMessage: 'Clear all text formatting',
      })}
    >
      <div className="icon-text-container">
        <i className="icon clear" />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.format.clear.text',
            defaultMessage: 'Clear Formatting',
          })}
        </span>
      </div>
      <span className="shortcut">{SHORTCUTS.CLEAR_FORMATTING}</span>
    </DropDownItem>
  );
}
