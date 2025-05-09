import { FORMAT_TEXT_COMMAND } from 'lexical';
import { ToolbarItemProps } from '../../../../supportedNodeTypes';
import { useIntl } from 'react-intl';
import { SHORTCUTS } from '../../ShortcutsPlugin/shortcuts';
import { DropDownItem } from '../../../ui/DropDown';
import { dropDownActiveClass } from '../codeLessUtils';

export function Bold({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <button
      disabled={!isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      }}
      className={'toolbar-item spaced ' + (toolbarState.isBold ? 'active' : '')}
      title={formatMessage(
        {
          id: 'lexical.plugin.toolbar.format.bold.title',
          defaultMessage: 'Bold ({shortcut})',
        },
        { shortcut: SHORTCUTS.BOLD }
      )}
      type="button"
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.bold.aria',
        defaultMessage: 'Format text as bold',
      })}
    >
      <i className="format bold" />
    </button>
  );
}

export function Italic({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <button
      disabled={!isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      }}
      className={'toolbar-item spaced ' + (toolbarState.isItalic ? 'active' : '')}
      title={formatMessage(
        {
          id: 'lexical.plugin.toolbar.format.italic.title',
          defaultMessage: 'Italic ({shortcut})',
        },
        { shortcut: SHORTCUTS.ITALIC }
      )}
      type="button"
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.italic.aria',
        defaultMessage: 'Format text as italics',
      })}
    >
      <i className="format italic" />
    </button>
  );
}

export function Underline({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <button
      disabled={!isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      }}
      className={'toolbar-item spaced ' + (toolbarState.isUnderline ? 'active' : '')}
      title={formatMessage(
        {
          id: 'lexical.plugin.toolbar.format.underline.title',
          defaultMessage: 'Underline ({shortcut})',
        },
        { shortcut: SHORTCUTS.UNDERLINE }
      )}
      type="button"
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.underline.aria',
        defaultMessage: 'Format text to underlined',
      })}
    >
      <i className="format underline" />
    </button>
  );
}

export function Lowercase({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase');
      }}
      className={'item wide ' + dropDownActiveClass(toolbarState.isLowercase)}
      title={formatMessage({
        id: 'lexical.plugin.toolbar.format.lowercase.title',
        defaultMessage: 'Lowercase',
      })}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.lowercase.aria',
        defaultMessage: 'Format text to lowercase',
      })}
    >
      <div className="icon-text-container">
        <i className="icon lowercase" />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.format.lowercase.text',
            defaultMessage: 'Lowercase',
          })}
        </span>
      </div>
      <span className="shortcut">{SHORTCUTS.LOWERCASE}</span>
    </DropDownItem>
  );
}

export function Uppercase({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase');
      }}
      className={'item wide ' + dropDownActiveClass(toolbarState.isUppercase)}
      title={formatMessage({
        id: 'lexical.plugin.toolbar.format.uppercase.title',
        defaultMessage: 'Uppercase',
      })}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.uppercase.aria',
        defaultMessage: 'Format text to uppercase',
      })}
    >
      <div className="icon-text-container">
        <i className="icon uppercase" />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.format.uppercase.text',
            defaultMessage: 'Uppercase',
          })}
        </span>
      </div>
      <span className="shortcut">{SHORTCUTS.UPPERCASE}</span>
    </DropDownItem>
  );
}

export function Capitalize({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize');
      }}
      className={'item wide ' + dropDownActiveClass(toolbarState.isCapitalize)}
      title={formatMessage({
        id: 'lexical.plugin.toolbar.format.capitalize.title',
        defaultMessage: 'Capitalize',
      })}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.capitalize.aria',
        defaultMessage: 'Format text to capitalize',
      })}
    >
      <div className="icon-text-container">
        <i className="icon capitalize" />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.format.capitalize.text',
            defaultMessage: 'Capitalize',
          })}
        </span>
      </div>
      <span className="shortcut">{SHORTCUTS.CAPITALIZE}</span>
    </DropDownItem>
  );
}

export function Strikethrough({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      }}
      className={'item wide ' + dropDownActiveClass(toolbarState.isStrikethrough)}
      title={formatMessage({
        id: 'lexical.plugin.toolbar.format.strikethrough.title',
        defaultMessage: 'Strikethrough',
      })}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.strikethrough.aria',
        defaultMessage: 'Format text with a strikethrough',
      })}
    >
      <div className="icon-text-container">
        <i className="icon strikethrough" />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.format.strikethrough.text',
            defaultMessage: 'Strikethrough',
          })}
        </span>
      </div>
      <span className="shortcut">{SHORTCUTS.STRIKETHROUGH}</span>
    </DropDownItem>
  );
}

export function Subscript({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
      }}
      className={'item wide ' + dropDownActiveClass(toolbarState.isSubscript)}
      title={formatMessage({
        id: 'lexical.plugin.toolbar.format.subscript.title',
        defaultMessage: 'Subscript',
      })}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.subscript.aria',
        defaultMessage: 'Format text with a subscript',
      })}
    >
      <div className="icon-text-container">
        <i className="icon subscript" />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.format.subscript.text',
            defaultMessage: 'Subscript',
          })}
        </span>
      </div>
      <span className="shortcut">{SHORTCUTS.SUBSCRIPT}</span>
    </DropDownItem>
  );
}

export function Superscript({ activeEditor, toolbarState, isEditable }: ToolbarItemProps) {
  const { formatMessage } = useIntl();

  return (
    <DropDownItem
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
      }}
      className={'item wide ' + dropDownActiveClass(toolbarState.isSuperscript)}
      title={formatMessage({
        id: 'lexical.plugin.toolbar.format.superscript.title',
        defaultMessage: 'Superscript',
      })}
      aria-label={formatMessage({
        id: 'lexical.plugin.toolbar.format.superscript.aria',
        defaultMessage: 'Format text with a superscript',
      })}
    >
      <div className="icon-text-container">
        <i className="icon superscript" />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.format.superscript.text',
            defaultMessage: 'Superscript',
          })}
        </span>
      </div>
      <span className="shortcut">{SHORTCUTS.SUPERSCRIPT}</span>
    </DropDownItem>
  );
}
