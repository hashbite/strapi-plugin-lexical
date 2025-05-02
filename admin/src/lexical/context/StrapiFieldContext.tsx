import { createContext, useContext } from 'react';

export type StrapiFieldConfig = {
  enabledNodeTypes: EnabledNodeTypes;
  enabledActions: EnabledActions;
  developers: DeveloperOptions;
};

export type EnabledNodeTypes = {
  bold: boolean;
};

type EnabledActions = {
  exportAsMarkdown: boolean;
};

type DeveloperOptions = {
  treeView: boolean;
};

const StrapiFieldConfigContext = createContext<StrapiFieldConfig | undefined>(undefined);

export const StrapiFieldConfigProvider = StrapiFieldConfigContext.Provider;

export const useStrapiFieldContext = () => {
  const context = useContext(StrapiFieldConfigContext);

  if (context === undefined) {
    throw new Error('useStrapiFieldContext must be used within a ToolbarProvider');
  }

  return context;
};
