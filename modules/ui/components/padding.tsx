import * as React from "react";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";

type PaddingProps = {
  children: React.ReactElement;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export const Padding = (props: PaddingProps) => {
  const theme = useTheme();

  const style: React.CSSProperties = {};

  if (props.top) {
    style.paddingTop = theme.spacing(props.top);
  }

  if (props.right) {
    style.paddingRight = theme.spacing(props.right);
  }

  if (props.bottom) {
    style.paddingBottom = theme.spacing(props.bottom);
  }

  if (props.left) {
    style.paddingLeft = theme.spacing(props.left);
  }

  return React.cloneElement(props.children, { style });
};
