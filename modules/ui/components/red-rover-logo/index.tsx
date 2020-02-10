import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  size?: "small" | "large";
  className?: string;
};

export const RedRoverLogo: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { size = "large" } = props;

  return (
    <Grid
      container
      className={`${classes.container} ${props.className}`}
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
    width: theme.typography.pxToRem(70),
  },
  logo: {
    color: theme.customColors.marigold,
  },
  productTitle: {
    color: theme.customColors.white,
    fontWeight: 600,
    marginLeft: theme.spacing(1),
    fontFamily: "Poppins",
  },
}));
