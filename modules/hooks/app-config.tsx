import * as React from "react";
import { useTheme } from "@material-ui/core/styles";

export type AppConfig = {
  contentWidth?: string;
};

type ContextValue = {
  appConfig: AppConfig;
  setAppConfig: (config: AppConfig) => void;
};

const Context = React.createContext<ContextValue>({
  appConfig: {},
  setAppConfig() {
    return undefined;
  },
});

export const AppConfigProvider = ({ children }: { children: any }) => {
  const theme = useTheme();

  const [appConfig, setAppConfig] = React.useState<AppConfig>({
    contentWidth: theme.customSpacing.contentWidth,
  });

  const store = {
    appConfig,
    setAppConfig,
  };

  return <Context.Provider value={store}>{children}</Context.Provider>;
};

export const useAppConfig = () => {
  return React.useContext(Context);
};

type AppConfigProps = {
  contentWidth?: string;
  children: any;
};

export const AppConfig = (props: AppConfigProps) => {
  const theme = useTheme();
  const { setAppConfig } = useAppConfig();

  const { contentWidth = theme.customSpacing.contentWidth, children } = props;

  React.useEffect(() => {
    setAppConfig({ contentWidth });

    return () =>
      setAppConfig({ contentWidth: theme.customSpacing.contentWidth });
  }, [contentWidth, setAppConfig, theme.customSpacing.contentWidth]);

  return children;
};
