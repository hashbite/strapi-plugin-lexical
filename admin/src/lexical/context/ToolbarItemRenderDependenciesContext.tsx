import { LexicalEditor } from 'lexical';
import { Dispatch, createContext, useContext } from 'react';

type ToolbarItemRenderDependencies = {
  activeEditor: LexicalEditor;
  isEditable: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
  setIsStrapiImageDialogOpen: Dispatch<boolean>;
  showModal: (title: string, showModal: (onClose: () => void) => JSX.Element) => void;
};
const ToolbarItemRenderDependenciesContext = createContext<
  ToolbarItemRenderDependencies | undefined
>(undefined);

export const ToolbarItemRenderDependenciesProvider = ToolbarItemRenderDependenciesContext.Provider;

export const useToolbarItemRenderDependencies = () => {
  const context = useContext(ToolbarItemRenderDependenciesContext);

  if (context === undefined) {
    throw new Error(
      'useToolbarItemRenderDependencies must be used within a ToolbarItemRenderDependenciesProvider'
    );
  }

  return context;
};
