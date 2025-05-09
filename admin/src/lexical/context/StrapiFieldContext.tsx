import { createContext, useContext } from 'react';
import { supportedNodeTypes } from '../../supportedNodeTypes';

export type StrapiFieldConfig = {
  enabledNodeTypes: EnabledNodeTypes;
  enabledActions: EnabledActions;
  fontSize: FontSize;
  fontFamily: FontFamily;
  developers: DeveloperOptions;
};

export type EnabledNodeTypes = {
  [key in keyof typeof supportedNodeTypes]: boolean;
};

type EnabledActions = {
  sessionHistory: boolean;
  clear: boolean;
  exportAsMarkdown: boolean;
  import: boolean;
  export: boolean;
};

export type FontSize = {
  enabled: boolean;
  default: number;
  minimum: number;
  maximum: number;
};

export type FontFamily = {
  enabled: boolean;
  families: string;
};

type DeveloperOptions = {
  treeView: boolean;
};

const StrapiFieldConfigContext = createContext<StrapiFieldConfig | undefined>(undefined);

export const StrapiFieldConfigProvider = StrapiFieldConfigContext.Provider;

export const defaultStrapiFieldConfig: StrapiFieldConfig = {
  enabledNodeTypes: {
    bold: supportedNodeTypes.bold.enabledByDefault,
    italic: supportedNodeTypes.italic.enabledByDefault,
    underline: supportedNodeTypes.underline.enabledByDefault,
    inlineCode: supportedNodeTypes.inlineCode.enabledByDefault,
    emojiPicker: supportedNodeTypes.emojiPicker.enabledByDefault,
    lowercase: supportedNodeTypes.lowercase.enabledByDefault,
    uppercase: supportedNodeTypes.uppercase.enabledByDefault,
    capitalize: supportedNodeTypes.capitalize.enabledByDefault,
    strikethrough: supportedNodeTypes.strikethrough.enabledByDefault,
    subscript: supportedNodeTypes.subscript.enabledByDefault,
    superscript: supportedNodeTypes.superscript.enabledByDefault,
    clearFormatting: supportedNodeTypes.clearFormatting.enabledByDefault,
    link: supportedNodeTypes.link.enabledByDefault,
    strapiImage: supportedNodeTypes.strapiImage.enabledByDefault,
    horizontalRule: supportedNodeTypes.horizontalRule.enabledByDefault,
    pageBreak: supportedNodeTypes.pageBreak.enabledByDefault,
    image: supportedNodeTypes.image.enabledByDefault,
    inlineImage: supportedNodeTypes.inlineImage.enabledByDefault,
    table: supportedNodeTypes.table.enabledByDefault,
    columns: supportedNodeTypes.columns.enabledByDefault,
    equation: supportedNodeTypes.equation.enabledByDefault,
    collapsible: supportedNodeTypes.collapsible.enabledByDefault,
  },
  enabledActions: {
    sessionHistory: true,
    clear: false,
    exportAsMarkdown: false,
    import: false,
    export: false,
  },
  fontSize: {
    enabled: false,
    default: 16,
    minimum: 12,
    maximum: 48,
  },
  fontFamily: {
    enabled: false,
    families: 'Arial;Courier New;Georgia;Times New Roman;Trebuchet MS;Verdana',
  },
  developers: {
    treeView: false,
  },
};

export const useStrapiFieldContext = () => {
  const context = useContext(StrapiFieldConfigContext);

  if (context === undefined) {
    throw new Error('useStrapiFieldContext must be used within a StrapiFieldConfigProvider');
  }

  return { ...defaultStrapiFieldConfig, ...context };
};
