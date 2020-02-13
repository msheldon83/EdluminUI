import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

type Props = {
  size?: "small" | "large";
  className?: string;
};

export const RedRoverLogo: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { size = "large" } = props;

  const classNames = clsx({
    [classes.container]: true,
    [classes.smallLogoContainer]: size === "small",
  });

  return (
    <Grid
      container
      className={`${classNames} ${props.className}`}
      alignItems="center"
      wrap="nowrap"
    >
      {size === "small" ? (
        <img
          src={require("ui/icons/red-rover-minor-logo.svg")}
          className={classes.minorLogo}
        />
      ) : (
        <img
          src={require("ui/icons/red-rover-major-logo.svg")}
          className={classes.majorLogo}
        />
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    ...theme.mixins.toolbar,
  },
  majorLogo: {
    width: theme.typography.pxToRem(150),
  },
  minorLogo: {
    width: theme.typography.pxToRem(53),
  },
  logo: {
    color: theme.customColors.marigold,
    marginLeft: 0,
  },
  smallLogoContainer: {
    marginLeft: 0,
  },
  productTitle: {
    color: theme.customColors.white,
    fontWeight: 600,
    marginLeft: theme.spacing(1),
    fontFamily: "Poppins",
  },
}));
