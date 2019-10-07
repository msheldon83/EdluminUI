import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import * as React from "react";
import { EdluminTheme } from "../../styles/mui-theme";

export function AppShell(props: { children: JSX.Element }) {
  const { children } = props;
  return (
    <ThemeProvider theme={EdluminTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
