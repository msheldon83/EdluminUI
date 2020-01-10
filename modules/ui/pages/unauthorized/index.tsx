import * as React from "react";
import { useTranslation } from "react-i18next";
import { Typography, makeStyles } from "@material-ui/core";

export const Unauthorized: React.FC<{}> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.message}>
      <Typography variant={"h1"}>
        {t("You do not have access to this page")}
      </Typography>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  message: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: theme.spacing(5),
  },
}));
