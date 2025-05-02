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
import { INSERT_IMAGE_COMMAND, InsertImageDialog, InsertImagePayload } from '../../ImagesPlugin';
import InsertLayoutDialog from '../../LayoutPlugin/InsertLayoutDialog';

export function Columns({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();
  const { setIsLinkEditMode, showModal } = useToolbarItemRenderDependencies();

  return (
    <DropDownItem
      onClick={() => {
        showModal(
          formatMessage({
            id: 'lexical.plugin.toolbar.insert.columns.modal.title',
            defaultMessage: 'Insert Columns Layout',
          }),
          (onClose) => <InsertLayoutDialog activeEditor={activeEditor} onClose={onClose} />
        );
      }}
      className="item"
    >
      <i className="icon columns" />
      <span className="text">
        {formatMessage({
          id: 'lexical.plugin.toolbar.insert.columns.text',
          defaultMessage: 'Columns Layout',
        })}
      </span>
    </DropDownItem>
  );
}
