import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { UnsavedChanges } from "../ui/components/unsaved-changes";

export type UnsavedChangesOptions = {
  anchorElement?: null | Element | ((element: Element) => Element);
  message: React.ReactNode;
  onSave: () => void;
  onDiscard: () => void;
};

export type UnsavedChangesProviderProps = {
  children: React.ReactNode;
};

type ContextValue = {
  openUnsavedChanges: (options: UnsavedChangesOptions) => void;
  closeUnsavedChanges: () => void;
};

// Defaults to make the compiler happy
const Context = React.createContext<ContextValue>({
  openUnsavedChanges() {
    return undefined;
  },
  closeUnsavedChanges() {
    return undefined;
  },
});

export const UnsavedChangesProvider = (props: UnsavedChangesProviderProps) => {
  const { children } = props;

  const defaultComponentProps = {
    anchorElement: document.body,
    message: "",
    onSave() {
      return undefined;
    },
    onDiscard() {
      return undefined;
    },
  };

  const [open, setOpen] = React.useState(false);
  const [componentProps, setComponentProps] = React.useState<
    UnsavedChangesOptions
  >(defaultComponentProps);

  const openUnsavedChanges = (options: UnsavedChangesOptions) => {
    setOpen(true);
    setComponentProps(options);
  };

  const closeUnsavedChanges = () => {
    setOpen(false);
  };

  return (
    <Context.Provider
      value={{
        openUnsavedChanges,
        closeUnsavedChanges,
      }}
    >
      {children}
      <UnsavedChanges open={open} {...componentProps} />
    </Context.Provider>
  );
};

export const useUnsavedChanges = () => {
  return React.useContext(Context);
};
