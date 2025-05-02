import { useIntl } from 'react-intl';
import { ToolbarItemProps } from '../../../../supportedNodeTypes';
import { SHORTCUTS } from '../../ShortcutsPlugin/shortcuts';
import { useCallback } from 'react';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { sanitizeUrl } from '../../../utils/url';
import { useToolbarItemRenderDependencies } from '../../../context/ToolbarItemRenderDependenciesContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { DropDownItem } from '../../../ui/DropDown';
import { dropDownActiveClass } from '../codeLessUtils';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';

export function HorizontalRule({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
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
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
      }}
      className="item"
    >
      <i className="icon horizonta l-rule" />
      <span className="text">
        {formatMessage({
          id: 'lexical.plugin.toolbar.insert.horizontalrule.text',
          defaultMessage: 'Horizontal Rule',
        })}
      </span>
    </DropDownItem>
  );
}
