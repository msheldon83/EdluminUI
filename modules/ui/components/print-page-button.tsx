import * as React from "react";
import { Print } from "@material-ui/icons";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core";

type Props = { className?: string };
export const PrintPageButton: React.FC<Props> = props => {
  const classes = useStyles({});
  return (
    <Print
      className={clsx(classes.print, props.className)}
      onClick={window.print}
    />
  );
};

const useStyles = makeStyles({
  print: {
    cursor: "pointer",
    color: "#9E9E9E",
    "@media print": {
      display: "none",
    },
  },
});
