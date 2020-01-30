import * as React from "react";
import { useTheme } from "@material-ui/core/styles";

type SpacingProps = {
  children: React.ReactElement;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export const Spacing = (props: SpacingProps) => {
  const theme = useTheme();

  const style: React.CSSProperties = {};

  if (props.top) {
    style.marginTop = theme.spacing(props.top);
  }

  if (props.right) {
    style.marginRight = theme.spacing(props.right);
  }

  if (props.bottom) {
    style.marginBottom = theme.spacing(props.bottom);
  }

  if (props.left) {
    style.marginLeft = theme.spacing(props.left);
  }

  return React.cloneElement(props.children, { style });
};
