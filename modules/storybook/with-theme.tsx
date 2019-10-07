import { MuiThemeProvider } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import * as React from "react";
import { EdluminTheme } from "ui/styles/mui-theme";

export const withTheme = (s: () => React.ReactElement) => (
  <MuiThemeProvider theme={EdluminTheme}>
    <ThemeProvider theme={EdluminTheme}>{s()}</ThemeProvider>
  </MuiThemeProvider>
);
