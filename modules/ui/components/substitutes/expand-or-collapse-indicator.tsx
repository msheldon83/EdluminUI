import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  isExpanded: boolean;
  className?: string;
};

export const ExpandOrCollapseIndicator: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={[classes.expand, props.className].join(" ")}>
      <Typography className={classes.smallText}>
        {props.isExpanded
          ? `– ${t("Click to collapse")}`
          : `+ ${t("Click to expand")}`}
      </Typography>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  expand: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    color: theme.customColors.edluminSubText,
    background: theme.customColors.lighterGray,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.sectionBorder
    }`,
  },
  smallText: {
    fontSize: theme.typography.pxToRem(12),
  },
}));
