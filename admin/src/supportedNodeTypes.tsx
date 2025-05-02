import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import EmojiPickerPlugin from './lexical/plugins/EmojiPickerPlugin';
import { LexicalEditor } from 'lexical';
import { ToolbarState } from './lexical/context/ToolbarContext';
import {
  Bold,
  Italic,
  Underline,
  Lowercase,
  Uppercase,
  Capitalize,
  Strikethrough,
  Subscript,
  Superscript,
} from './lexical/plugins/ToolbarPlugin/toolbarItems/richText';
import { ClearFormatting } from './lexical/plugins/ToolbarPlugin/toolbarItems/other';
import { Code } from './lexical/plugins/ToolbarPlugin/toolbarItems/code';
import LinkPlugin from './lexical/plugins/LinkPlugin';
import { Link } from './lexical/plugins/ToolbarPlugin/toolbarItems/link';
import { Equation } from './lexical/plugins/ToolbarPlugin/toolbarItems/equation';
import { Table } from './lexical/plugins/ToolbarPlugin/toolbarItems/table';
import { Collapsible } from './lexical/plugins/ToolbarPlugin/toolbarItems/collapsible';
import { Columns } from './lexical/plugins/ToolbarPlugin/toolbarItems/columns';
import { Image, InlineImage } from './lexical/plugins/ToolbarPlugin/toolbarItems/image';
import StrapiImagePlugin from './lexical/plugins/StrapiImagePlugin';
import { StrapiImage } from './lexical/plugins/ToolbarPlugin/toolbarItems/strapiImage';
import { HorizontalRule } from './lexical/plugins/ToolbarPlugin/toolbarItems/horizontalRule';
import { PageBreak } from './lexical/plugins/ToolbarPlugin/toolbarItems/pageBreak';
import ContentEditable from './lexical/ui/ContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalEditorProps } from './lexical/Editor';
import { StrapiFieldConfig, useStrapiFieldContext } from './lexical/context/StrapiFieldContext';

/**
 * This is a "hack type" until we have figured out a shared base type for Lexical plugins
 */
type LexicalPlugin<T = any> = (props: T) => JSX.Element | null;

type RenderPluginProps = {
  lexicalEditorProps: LexicalEditorProps;
  onRef: (floatingAnchorElem: HTMLDivElement) => void;
  placeholder: string;
};

export type ToolbarItemProps = {
  activeEditor: LexicalEditor;
  toolbarState: ToolbarState;
  isEditable: boolean;
};

type SupportedNodeType = {
  id: string;
  defaultLabel: string;
  defaultDescription: string;
  lexicalPlugin?: LexicalPlugin<RenderPluginProps>;
  renderToolbarItem?: React.FunctionComponent<ToolbarItemProps>;
};

function RichTextLexicalPlugin({ lexicalEditorProps, onRef, placeholder }: RenderPluginProps) {
  return (
    <RichTextPlugin
      contentEditable={
        <div className="editor-scroller">
          <div className="editor" ref={onRef}>
            <ContentEditable placeholder={placeholder} ref={lexicalEditorProps.ref} />
          </div>
        </div>
      }
      ErrorBoundary={LexicalErrorBoundary}
    />
  );
}

const bold: SupportedNodeType = {
  id: 'bold',
  defaultLabel: 'Bold',
  defaultDescription: 'Enable bold text',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Bold,
};

const italic: SupportedNodeType = {
  id: 'italic',
  defaultLabel: 'Italic',
  defaultDescription: 'Enable italic text',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Italic,
};

const underline: SupportedNodeType = {
  id: 'underline',
  defaultLabel: 'Underline',
  defaultDescription: 'Enable underlining of text',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Underline,
};

const emojiPicker: SupportedNodeType = {
  id: 'emojiPicker',
  defaultLabel: 'Emoji Picker',
  defaultDescription: 'Enable emoji picker',
  lexicalPlugin: () => <EmojiPickerPlugin />,
};

const inlineCode: SupportedNodeType = {
  id: 'inlineCode',
  defaultLabel: 'Inline Code',
  defaultDescription: 'Enable inline monospace-code',
  // TODO: really?
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Code,
};

const link: SupportedNodeType = {
  id: 'link',
  defaultLabel: 'Links',
  defaultDescription: 'Enable links to Strapi-internal and external targets',
  lexicalPlugin: () => <LinkPlugin />,
  renderToolbarItem: Link,
};

const strapiImage: SupportedNodeType = {
  id: 'strapiImage',
  defaultLabel: 'Strapi Images',
  defaultDescription: "Enable embedding images from Strapi's media gallery",
  lexicalPlugin: StrapiImagePlugin,
  renderToolbarItem: StrapiImage,
};

const lowercase: SupportedNodeType = {
  id: 'lowercase',
  defaultLabel: 'Lowercase',
  defaultDescription: 'Enable inline lowercase',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Lowercase,
};

const uppercase: SupportedNodeType = {
  id: 'uppercase',
  defaultLabel: 'Uppercase',
  defaultDescription: 'Enable inline uppercase',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Uppercase,
};

const capitalize: SupportedNodeType = {
  id: 'capitalize',
  defaultLabel: 'Capitalize',
  defaultDescription: 'Enable inline capitalize',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Capitalize,
};

const strikethrough: SupportedNodeType = {
  id: 'strikethrough',
  defaultLabel: 'Strikethrough',
  defaultDescription: 'Enable inline strikethrough',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Strikethrough,
};

const subscript: SupportedNodeType = {
  id: 'subscript',
  defaultLabel: 'Subscript',
  defaultDescription: 'Enable inline subscript',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Subscript,
};

const superscript: SupportedNodeType = {
  id: 'superscript',
  defaultLabel: 'Superscript',
  defaultDescription: 'Enable inline superscript',
  lexicalPlugin: RichTextLexicalPlugin,
  renderToolbarItem: Superscript,
};

const clearFormatting: SupportedNodeType = {
  id: 'clearFormatting',
  defaultLabel: 'Clear Formatting',
  defaultDescription: 'Enable button to clear formatting',
  renderToolbarItem: ClearFormatting,
};

const horizontalRule: SupportedNodeType = {
  id: 'horizontalRule',
  defaultLabel: 'Horizontal Rule',
  defaultDescription: 'Enable horizontal rule',
  renderToolbarItem: HorizontalRule,
};

const pageBreak: SupportedNodeType = {
  id: 'pageBreak',
  defaultLabel: 'Page Break',
  defaultDescription: 'Enable page break',
  renderToolbarItem: PageBreak,
};

const image: SupportedNodeType = {
  id: 'image',
  defaultLabel: 'Image',
  defaultDescription: 'Enable image',
  renderToolbarItem: Image,
};

const inlineImage: SupportedNodeType = {
  id: 'inlineImage',
  defaultLabel: 'Inline Image',
  defaultDescription: 'Enable inline image',
  renderToolbarItem: InlineImage,
};

const table: SupportedNodeType = {
  id: 'table',
  defaultLabel: 'Table',
  defaultDescription: 'Enable table',
  renderToolbarItem: Table,
};

const columns: SupportedNodeType = {
  id: 'columns',
  defaultLabel: 'Columns',
  defaultDescription: 'Enable columns',
  renderToolbarItem: Columns,
};

const equation: SupportedNodeType = {
  id: 'equation',
  defaultLabel: 'Equation',
  defaultDescription: 'Enable equation',
  renderToolbarItem: Equation,
};

const collapsible: SupportedNodeType = {
  id: 'collapsible',
  defaultLabel: 'Collapsible',
  defaultDescription: 'Enable collapsible',
  renderToolbarItem: Collapsible,
};

export {
  bold,
  italic,
  underline,
  inlineCode,
  emojiPicker,
  lowercase,
  uppercase,
  capitalize,
  strikethrough,
  subscript,
  superscript,
  clearFormatting,
  link,
  strapiImage,
  horizontalRule,
  pageBreak,
  image,
  inlineImage,
  table,
  columns,
};

export const supportedNodeTypes = {
  bold,
  italic,
  underline,
  inlineCode,
  emojiPicker,
  lowercase,
  uppercase,
  capitalize,
  strikethrough,
  subscript,
  superscript,
  clearFormatting,
  link,
  strapiImage,
  horizontalRule,
  pageBreak,
  image,
  inlineImage,
  table,
  columns,
  equation,
  collapsible,
};

function getUniquePlugins(strapiFieldConfig: StrapiFieldConfig) {
  const plugins = new Set<LexicalPlugin<RenderPluginProps>>();

  for (const [nodeTypeId, enabled] of Object.entries(strapiFieldConfig.enabledNodeTypes)) {
    if (!enabled) {
      continue;
    }
    const nodeType = supportedNodeTypes[nodeTypeId as keyof typeof supportedNodeTypes];

    if (nodeType.lexicalPlugin) {
      plugins.add(nodeType.lexicalPlugin);
    }
  }

  return Array.from(plugins);
}

export function SupportedNodeTypePlugins(props: RenderPluginProps) {
  const strapiFieldConfig = useStrapiFieldContext();
  const plugins = getUniquePlugins(strapiFieldConfig);

  return <>{...plugins.map((Plugin, i) => <Plugin key={i} {...props} />)}</>;
}
