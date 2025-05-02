/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from 'react';
import { Children } from 'react';
import { useIntl } from 'react-intl';

import {
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { INSERT_EMBED_COMMAND } from '@lexical/react/LexicalAutoEmbedPlugin';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { $isHeadingNode } from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from '@lexical/selection';
import { $isTableNode, $isTableSelection } from '@lexical/table';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  mergeRegister,
} from '@lexical/utils';
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  LexicalEditor,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import * as React from 'react';
import { Dispatch, useCallback, useEffect, useState } from 'react';
import { IS_APPLE } from '../../utils/environment';

import { useStrapiApp } from '@strapi/strapi/admin';
import { blockTypeToBlockName, useToolbarState } from '../../context/ToolbarContext';
import useModal from '../../hooks/useModal';
import { $createStickyNode } from '../../nodes/StickyNode';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { EmbedConfigs } from '../AutoEmbedPlugin';

import { INSERT_IMAGE_COMMAND, InsertImageDialog, InsertImagePayload } from '../ImagesPlugin';
import { InsertInlineImageDialog } from '../InlineImagePlugin';

import { InsertPollDialog } from '../PollPlugin';
import { SHORTCUTS } from '../ShortcutsPlugin/shortcuts';
import { InsertStrapiImageDialog } from '../StrapiImagePlugin';

import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from './utils';
import { HistoryRedo, HistoryUndo } from './toolbarItems/history';
import {
  ToolbarItemRenderDependenciesProvider,
  useToolbarItemRenderDependencies,
} from '../../context/ToolbarItemRenderDependenciesContext';
import { EnabledNodeTypes, useStrapiFieldContext } from '../../context/StrapiFieldContext';
import { supportedNodeTypes } from '../../../supportedNodeTypes';
import { dropDownActiveClass, clearFormatting } from './codeLessUtils';

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
];

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: 'center-align',
    iconRTL: 'center-align',
    name: 'Center Align',
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'End Align',
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justify Align',
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Left Align',
  },
  right: {
    icon: 'right-align',
    iconRTL: 'right-align',
    name: 'Right Align',
  },
  start: {
    icon: 'left-align',
    iconRTL: 'right-align',
    name: 'Start Align',
  },
};

// @todo: extract to external file
function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const { formatMessage } = useIntl();

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={'icon block-type ' + blockType}
      buttonLabel={formatMessage({
        id: `lexical.content.block.type.${blockType}`,
        defaultMessage: blockTypeToBlockName[blockType],
      })}
      buttonAriaLabel={formatMessage({
        id: 'lexical.plugin.toolbar.block.aria',
        defaultMessage: 'Formatting options for text style',
      })}
    >
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'paragraph')}
        onClick={() => formatParagraph(editor)}
      >
        <div className="icon-text-container">
          <i className="icon paragraph" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.paragraph',
              defaultMessage: 'Paragraph',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.NORMAL}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading(editor, blockType, 'h1')}
      >
        <div className="icon-text-container">
          <i className="icon h1" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.h1',
              defaultMessage: 'Heading 1',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING1}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading(editor, blockType, 'h2')}
      >
        <div className="icon-text-container">
          <i className="icon h2" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.h2',
              defaultMessage: 'Heading 2',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING2}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading(editor, blockType, 'h3')}
      >
        <div className="icon-text-container">
          <i className="icon h3" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.h3',
              defaultMessage: 'Heading 3',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING3}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={() => formatBulletList(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon bullet-list" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.bullet',
              defaultMessage: 'Bullet List',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.BULLET_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'number')}
        onClick={() => formatNumberedList(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon numbered-list" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.number',
              defaultMessage: 'Numbered List',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.NUMBERED_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'check')}
        onClick={() => formatCheckList(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon check-list" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.check',
              defaultMessage: 'Check List',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.CHECK_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'quote')}
        onClick={() => formatQuote(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon quote" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.quote',
              defaultMessage: 'Quote',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.QUOTE}</span>
      </DropDownItem>
      <DropDownItem
        className={'item wide ' + dropDownActiveClass(blockType === 'code')}
        onClick={() => formatCode(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon code" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.block.code',
              defaultMessage: 'Code Block',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.CODE_BLOCK}</span>
      </DropDownItem>
    </DropDown>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

// @todo: extract to external file
function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const { formatMessage } = useIntl();

  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  const buttonAriaLabel = formatMessage(
    {
      id: `lexical.plugin.toolbar.font.button.title`,
      defaultMessage: 'Formatting options for font {property}',
    },
    { property: style === 'font-family' ? 'family' : 'style' }
  );

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={'toolbar-item ' + style}
      buttonLabel={value}
      buttonIconClassName={style === 'font-family' ? 'icon block-type font-family' : ''}
      buttonAriaLabel={buttonAriaLabel}
    >
      {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(([option, text]) => (
        <DropDownItem
          className={`item ${dropDownActiveClass(value === option)} ${
            style === 'font-size' ? 'fontsize-item' : ''
          }`}
          onClick={() => handleClick(option)}
          key={option}
        >
          <span className="text">{text}</span>
        </DropDownItem>
      ))}
    </DropDown>
  );
}

// @todo: extract to external file
function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const { formatMessage } = useIntl();
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatMessage({
        id: `lexical.plugin.toolbar.align.${value || 'left'}`,
        defaultMessage: formatOption.name,
      })}
      buttonIconClassName={`icon ${isRTL ? formatOption.iconRTL : formatOption.icon}`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel={formatMessage({
        id: 'lexical.plugin.toolbar.align.aria',
        defaultMessage: 'Formatting options for text alignment',
      })}
    >
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <i className="icon left-align" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.align.left',
              defaultMessage: 'Left Align',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.LEFT_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <i className="icon center-align" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.align.center',
              defaultMessage: 'Center Align',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.CENTER_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <i className="icon right-align" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.align.right',
              defaultMessage: 'Right Align',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.RIGHT_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <i className="icon justify-align" />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.align.justify',
              defaultMessage: 'Justify Align',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.JUSTIFY_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start');
        }}
        className="item wide"
      >
        <i
          className={`icon ${
            isRTL ? ELEMENT_FORMAT_OPTIONS.start.iconRTL : ELEMENT_FORMAT_OPTIONS.start.icon
          }`}
        />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.align.start',
            defaultMessage: 'Start Align',
          })}
        </span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end');
        }}
        className="item wide"
      >
        <i
          className={`icon ${
            isRTL ? ELEMENT_FORMAT_OPTIONS.end.iconRTL : ELEMENT_FORMAT_OPTIONS.end.icon
          }`}
        />
        <span className="text">
          {formatMessage({
            id: 'lexical.plugin.toolbar.align.end',
            defaultMessage: 'End Align',
          })}
        </span>
      </DropDownItem>
      <Divider />
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <i className={'icon ' + (isRTL ? 'indent' : 'outdent')} />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.indent.outdent',
              defaultMessage: 'Outdent',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.OUTDENT}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className="item wide"
      >
        <div className="icon-text-container">
          <i className={'icon ' + (isRTL ? 'outdent' : 'indent')} />
          <span className="text">
            {formatMessage({
              id: 'lexical.plugin.toolbar.indent.indent',
              defaultMessage: 'Indent',
            })}
          </span>
        </div>
        <span className="shortcut">{SHORTCUTS.INDENT}</span>
      </DropDownItem>
    </DropDown>
  );
}

function ToolbarItem(props: { id: string }): React.ReactNode {
  const { toolbarState } = useToolbarState();
  const renderDependencies = useToolbarItemRenderDependencies();
  const strapiFieldConfig = useStrapiFieldContext();

  if (props.id.startsWith('nodeType')) {
    const [, nodeTypeId] = props.id.split('.');
    const enabled = strapiFieldConfig.enabledNodeTypes[nodeTypeId as keyof EnabledNodeTypes];
    const nodeType = supportedNodeTypes[nodeTypeId as keyof typeof supportedNodeTypes];
    if (enabled && nodeType?.renderToolbarItem) {
      const Item = nodeType.renderToolbarItem;
      return (
        <Item
          toolbarState={toolbarState}
          activeEditor={renderDependencies.activeEditor}
          isEditable={renderDependencies.isEditable}
        />
      );
    }
  }

  if (props.id === 'actions.history.undo') {
    return (
      <HistoryUndo
        toolbarState={toolbarState}
        activeEditor={renderDependencies.activeEditor}
        isEditable={renderDependencies.isEditable}
      />
    );
  }
  if (props.id === 'actions.history.redo') {
    return (
      <HistoryRedo
        toolbarState={toolbarState}
        activeEditor={renderDependencies.activeEditor}
        isEditable={renderDependencies.isEditable}
      />
    );
  }

  // @todo what about the floating actions?
  // @todo the floating toolbar also needs to adjust itself!

  return undefined;
}

function ToolbarGroup(props: React.PropsWithChildren<{}>) {
  const groupElements = Children.map(props.children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }
    if (element.type !== ToolbarItem) {
      // Ignore unknown elements
      // TODO: fail with good error message?
      return;
    }

    return element;
  });

  if (!groupElements || !Children.count(groupElements)) {
    // Return an empty group if all elements are disabled
    // @todo this is not working! toolbar still renders as "just a divider"
    return;
  }

  return (
    <>
      {...groupElements}
      <Divider />
    </>
  );
}

function ToolbarDropDown(
  props: React.PropsWithChildren<{
    buttonAriaLabel: string;
    buttonLabel: string;
    buttonIconClassName: string;
  }>
) {
  const { toolbarState } = useToolbarState();
  const renderDependencies = useToolbarItemRenderDependencies();
  const strapiFieldConfig = useStrapiFieldContext();

  const groupElements = Children.map(props.children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return;
    }
    if (element.type !== ToolbarItem) {
      // Ignore unknown elements
      // TODO: fail with good error message?
      return;
    }

    return element;
  });

  if (!groupElements || !Children.count(groupElements)) {
    // Return an empty group if all elements are disabled
    // @todo this is not working! toolbar still renders as "just a divider"
    return;
  }

  return (
    <>
      <DropDown
        disabled={!renderDependencies.isEditable}
        buttonClassName="toolbar-item spaced"
        buttonLabel={props.buttonLabel}
        buttonAriaLabel={props.buttonAriaLabel}
        buttonIconClassName={props.buttonIconClassName}
      >
        {...groupElements}
      </DropDown>
      <Divider />
    </>
  );
}

export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const { formatMessage } = useIntl();

  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        updateToolbarState(
          'isImageCaption',
          !!rootElement?.parentElement?.classList.contains('image-caption-container')
        );
      } else {
        updateToolbarState('isImageCaption', false);
      }

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      updateToolbarState('isRTL', $isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState('isLink', isLink);

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        updateToolbarState('rootType', 'table');
      } else {
        updateToolbarState('rootType', 'root');
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();

          updateToolbarState('blockType', type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            updateToolbarState('blockType', type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            updateToolbarState(
              'codeLanguage',
              language ? CODE_LANGUAGE_MAP[language] || language : ''
            );
            return;
          }
        }
      }
      // Handle buttons
      updateToolbarState(
        'fontColor',
        $getSelectionStyleValueForProperty(selection, 'color', '#000')
      );
      updateToolbarState(
        'bgColor',
        $getSelectionStyleValueForProperty(selection, 'background-color', '#fff')
      );
      updateToolbarState(
        'fontFamily',
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial')
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      // If matchingParent is a valid node, pass it's format type
      updateToolbarState(
        'elementFormat',
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left'
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      // Update text format
      updateToolbarState('isBold', selection.hasFormat('bold'));
      updateToolbarState('isItalic', selection.hasFormat('italic'));
      updateToolbarState('isUnderline', selection.hasFormat('underline'));
      updateToolbarState('isStrikethrough', selection.hasFormat('strikethrough'));
      updateToolbarState('isSubscript', selection.hasFormat('subscript'));
      updateToolbarState('isSuperscript', selection.hasFormat('superscript'));
      updateToolbarState('isCode', selection.hasFormat('code'));
      updateToolbarState(
        'fontSize',
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px')
      );
      updateToolbarState('isLowercase', selection.hasFormat('lowercase'));
      updateToolbarState('isUppercase', selection.hasFormat('uppercase'));
      updateToolbarState('isCapitalize', selection.hasFormat('capitalize'));
    }
  }, [activeEditor, editor, updateToolbarState]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState('canUndo', payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState('canRedo', payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {}
      );
    },
    [activeEditor]
  );

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ 'background-color': value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );
  const insertGifOnClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const canViewerSeeInsertDropdown = !toolbarState.isImageCaption;

  const [isStrapiImageDialogOpen, setIsStrapiImageDialogOpen] = useState(false);

  const components = useStrapiApp('ImageDialog', (state) => state.components);

  const MediaLibraryDialog = components['media-library'] as React.ComponentType<{
    allowedTypes: string[];
    onClose: () => void;
    onSelectAssets: (assets: any[]) => void;
  }>;

  return (
    <ToolbarItemRenderDependenciesProvider
      value={{ activeEditor, isEditable, setIsLinkEditMode, setIsStrapiImageDialogOpen, showModal }}
    >
      <div className="toolbar">
        <ToolbarGroup>
          <ToolbarItem id="actions.history.undo" />
          <ToolbarItem id="actions.history.redo" />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem id="meta.blockTypes" />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem id="meta.blockTypes" />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem id="nodeTypes.bold" />
          <ToolbarItem id="nodeTypes.italic" />
          <ToolbarItem id="nodeTypes.underline" />
          <ToolbarItem id="nodeTypes.inlineCode" />
          {/* TODO: how to support a nested "additional options" */}
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem id="nodeType.link"></ToolbarItem>
          <ToolbarItem id="nodeType.strapiImage"></ToolbarItem>
          {isStrapiImageDialogOpen && (
            <InsertStrapiImageDialog
              MediaLibraryDialog={MediaLibraryDialog}
              activeEditor={activeEditor}
              onClose={() => setIsStrapiImageDialogOpen(false)}
            />
          )}
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem id="nodeType.textAlign"></ToolbarItem>
        </ToolbarGroup>
        <ToolbarDropDown
          buttonLabel=""
          buttonIconClassName="icon dropdown-more"
          buttonAriaLabel={formatMessage({
            id: 'lexical.plugin.toolbar.format.more.aria',
            defaultMessage: 'Formatting options for additional text styles',
          })}
        >
          <ToolbarItem id="nodeType.lowercase"></ToolbarItem>
          <ToolbarItem id="nodeType.uppercase"></ToolbarItem>
          <ToolbarItem id="nodeType.capitalize"></ToolbarItem>
          <ToolbarItem id="nodeType.strikethrough"></ToolbarItem>
          <ToolbarItem id="nodeType.subscript"></ToolbarItem>
          <ToolbarItem id="nodeType.superscript"></ToolbarItem>
          <ToolbarItem id="nodeType.highlight"></ToolbarItem>
          <ToolbarItem id="nodeType.clearFormatting"></ToolbarItem>
        </ToolbarDropDown>

        <ToolbarDropDown
          buttonLabel={formatMessage({
            id: 'lexical.plugin.toolbar.insert.button.text',
            defaultMessage: 'Insert',
          })}
          buttonAriaLabel={formatMessage({
            id: 'lexical.plugin.toolbar.insert.button.aria',
            defaultMessage: 'Insert specialized editor node',
          })}
          buttonIconClassName="icon plus"
        >
          <ToolbarItem id="nodeType.horizontalRule"></ToolbarItem>
          <ToolbarItem id="nodeType.pageBreak"></ToolbarItem>
          <ToolbarItem id="nodeType.image"></ToolbarItem>
          <ToolbarItem id="nodeType.inlineImage"></ToolbarItem>
          <ToolbarItem id="nodeType.table"></ToolbarItem>
          <ToolbarItem id="nodeType.columns"></ToolbarItem>
          <ToolbarItem id="nodeType.equation"></ToolbarItem>
          <ToolbarItem id="nodeType.collapsible"></ToolbarItem>

          {EmbedConfigs.map((embedConfig) => (
            <DropDownItem
              key={embedConfig.type}
              onClick={() => {
                activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type);
              }}
              className="item"
            >
              {embedConfig.icon}
              <span className="text">{embedConfig.contentName}</span>
            </DropDownItem>
          ))}
        </ToolbarDropDown>

        {/* @todo */}
        {toolbarState.blockType in blockTypeToBlockName && activeEditor === editor && (
          <>
            <BlockFormatDropDown
              disabled={!isEditable}
              blockType={toolbarState.blockType}
              rootType={toolbarState.rootType}
              editor={activeEditor}
            />
            <Divider />
          </>
        )}

        {/* @todo */}
        {toolbarState.blockType === 'code' ? (
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item code-language"
            buttonLabel={getLanguageFriendlyName(toolbarState.codeLanguage)}
            buttonAriaLabel="Select language"
          >
            {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
              return (
                <DropDownItem
                  className={`item ${dropDownActiveClass(value === toolbarState.codeLanguage)}`}
                  onClick={() => onCodeLanguageSelect(value)}
                  key={value}
                >
                  <span className="text">{name}</span>
                </DropDownItem>
              );
            })}
          </DropDown>
        ) : (
          <>
            {/* <FontDropDown
            disabled={!isEditable}
            style={'font-family'}
            value={toolbarState.fontFamily}
            editor={activeEditor}
          />
          <Divider />
          <FontSize
            selectionFontSize={toolbarState.fontSize.slice(0, -2)}
            editor={activeEditor}
            disabled={!isEditable}
          />
          <Divider /> */}

            <Divider />

            {/* @todo */}
            <ElementFormatDropdown
              disabled={!isEditable}
              value={toolbarState.elementFormat}
              editor={activeEditor}
              isRTL={toolbarState.isRTL}
            />
          </>
        )}
        {modal}
      </div>
    </ToolbarItemRenderDependenciesProvider>
  );
}
