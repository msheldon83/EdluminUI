import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

export const ManualFillBanner: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <VisibilityOffIcon className={classes.icon} />
      <div className={classes.text}>
        {t(
          "Manual fill mode enabled. Substitutes cannot see this assignment. DISABLE"
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1),
    width: "100%",
    background: "#FFF5CC",
    display: "flex",
    textAlign: "center",
  },
  icon: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    height: "20px",
    width: "20px",
  },
  text: {
    lineHeight: "24px",
    verticalAlign: "middle",
  },
}));
