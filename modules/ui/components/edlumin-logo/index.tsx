import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  className?: string;
  showSmallLogo?: boolean;
};

export const EdluminLogo: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid
      container
      className={`${classes.container} ${props.className}`}
      alignItems="center"
      wrap="nowrap"
    >
      {props.showSmallLogo ? (
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
    width: theme.typography.pxToRem(225),
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
