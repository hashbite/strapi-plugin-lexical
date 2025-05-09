import { createContext, useContext } from 'react';

export type StrapiFieldConfig = {
  enabledNodeTypes: EnabledNodeTypes;
  enabledActions: EnabledActions;
  fontSize: FontSize;
  fontFamily: FontFamily;
  developers: DeveloperOptions;
};

export type EnabledNodeTypes = {
  bold: boolean;
  [key: string]: boolean;
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
    bold: true,
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
