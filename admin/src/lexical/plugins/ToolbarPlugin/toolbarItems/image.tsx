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
import { InsertInlineImageDialog } from '../../InlineImagePlugin';

export function Image({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();
  const { setIsLinkEditMode, showModal } = useToolbarItemRenderDependencies();

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
        showModal(
          formatMessage({
            id: 'lexical.plugin.toolbar.insert.image.modal.title',
            defaultMessage: 'Insert Image',
          }),
          (onClose) => <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
        );
      }}
      className="item"
    >
      <i className="icon image" />
      <span className="text">
        {formatMessage({
          id: 'lexical.plugin.toolbar.insert.image.text',
          defaultMessage: 'Image',
        })}
      </span>
    </DropDownItem>
  );
}

export function InlineImage({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();
  const { setIsLinkEditMode, showModal } = useToolbarItemRenderDependencies();

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
        showModal(
          formatMessage({
            id: 'lexical.plugin.toolbar.insert.inlineimage.modal.title',
            defaultMessage: 'Insert Inline Image',
          }),
          (onClose) => <InsertInlineImageDialog activeEditor={activeEditor} onClose={onClose} />
        );
      }}
      className="item"
    >
      <i className="icon image" />
      <span className="text">
        {formatMessage({
          id: 'lexical.plugin.toolbar.insert.inlineimage.text',
          defaultMessage: 'Inline Image',
        })}
      </span>
    </DropDownItem>
  );
}
