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
import { INSERT_COLLAPSIBLE_COMMAND } from '../../CollapsiblePlugin';

export function Collapsible({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
      }}
      className="item"
    >
      <i className="icon caret-right" />
      <span className="text">
        {formatMessage({
          id: 'lexical.plugin.toolbar.insert.collapsible.text',
          defaultMessage: 'Collapsible container',
        })}
      </span>
    </DropDownItem>
  );
}
