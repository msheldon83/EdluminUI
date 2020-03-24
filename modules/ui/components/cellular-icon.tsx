import * as React from "react";
import { makeStyles } from "@material-ui/core";

type Props = {
  highlightedBars: number;
};

export const CellularIcon: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <div>
      <div
        className={
          (props.highlightedBars > 1 ? classes.darkFill : classes.lightFill,
          classes.bar1)
        }
      ></div>
      <div
        className={
          (props.highlightedBars > 1 ? classes.darkFill : classes.lightFill,
          classes.bar2)
        }
      ></div>
      <div
        className={
          (props.highlightedBars > 2 ? classes.darkFill : classes.lightFill,
          classes.bar3)
        }
      ></div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  bar1: {
    height: "7px",
    width: "10px",
    paddingRight: "5px",
    display: "inline-block",
  },
  bar2: {
    height: "10px",
    width: "10px",
    paddingRight: "5px",
    display: "inline-block",
  },
  bar3: {
    height: "13px",
    width: "10px",
    paddingRight: "5px",
    display: "inline-block",
  },
  darkFill: {
    backgroundColor: theme.customColors.edluminSlate,
  },
  lightFill: {
    backgroundColor: theme.customColors.edluminSubText,
  },
}));
