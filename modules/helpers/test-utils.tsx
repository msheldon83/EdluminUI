import * as React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { render, RenderOptions } from "@testing-library/react";
import { EdluminTheme } from "ui/styles/mui-theme";
import "../../entry/i18n";
import * as clsx from "clsx";

type UiRenderOptions = Omit<RenderOptions, "queries">;

const customRender = (
  component: React.ReactElement,
  options?: UiRenderOptions
) => {
  return render(
    <ThemeProvider theme={EdluminTheme}>
      <CssBaseline />
      {component}
    </ThemeProvider>,
    { ...options }
  );
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
