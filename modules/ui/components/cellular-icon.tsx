import clsx from "clsx";
import * as React from "react";
import { makeStyles } from "@material-ui/core";

type Props = {
  highlightedBars: number;
};

export const CellularIcon: React.FC<Props> = props => {
  const classes = useStyles();

  const bar1 = clsx({
    [classes.darkFill]: props.highlightedBars > 0 ? true : false,
    [classes.lightFill]: props.highlightedBars == 0 ? true : false,
    [classes.bar1]: true,
  });
  const bar2 = clsx({
    [classes.darkFill]: props.highlightedBars > 1 ? true : false,
    [classes.lightFill]: props.highlightedBars <= 1 ? true : false,
    [classes.bar2]: true,
  });
  const bar3 = clsx({
    [classes.darkFill]: props.highlightedBars > 2 ? true : false,
    [classes.lightFill]: props.highlightedBars <= 2 ? true : false,
    [classes.bar3]: true,
  });

  return (
    <div className={classes.bars}>
      <div className={bar1}></div>
      <div className={bar2}></div>
      <div className={bar3}></div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  bars: {
    marginLeft: "20px",
    width: "30px",
    height: "25px",
  },
  bar1: {
    height: "9px",
    width: "3px",
    marginLeft: "3px",

    display: "inline-block",
  },
  bar2: {
    height: "15px",
    width: "3px",
    marginLeft: "3px",

    display: "inline-block",
  },
  bar3: {
    height: "20px",
    width: "3px",
    marginLeft: "3px",
    display: "inline-block",
  },
  darkFill: {
    backgroundColor: theme.customColors.edluminSlate,
  },
  lightFill: {
    backgroundColor: theme.customColors.edluminSubText,
  },
}));
