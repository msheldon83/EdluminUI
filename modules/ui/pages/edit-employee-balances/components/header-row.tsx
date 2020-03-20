import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

export const BalanceHeaderRow: React.FC<{}> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.reasonContainer}></div>
      <div className={[classes.text, classes.balanceValueContainer].join(" ")}>
        {t("Initial balance")}
      </div>
      <div className={[classes.text, classes.asOfContainer].join(" ")}>
        {t("As of")}
      </div>
      <div className={[classes.text, classes.valueContainer].join(" ")}>
        {t("Used")}
      </div>
      <div className={[classes.text, classes.valueContainer].join(" ")}>
        {t("Planned")}
      </div>
      <div className={[classes.text, classes.valueContainer].join(" ")}>
        {t("Remaining")}
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    display: "flex",
    border: "1px solid #F5F5F5",
    alignItems: "center",
  },
  text: {
    fontSize: theme.typography.pxToRem(14),
    color: "#9E9E9E",
  },
  reasonContainer: {
    width: theme.typography.pxToRem(270),
    padding: theme.spacing(2),
  },
  balanceValueContainer: {
    width: theme.typography.pxToRem(150),
    paddingLeft: theme.spacing(1),
  },
  asOfContainer: {
    width: theme.typography.pxToRem(140),
    margin: theme.spacing(1, 4, 1, 4),
  },
  valueContainer: {
    width: theme.typography.pxToRem(100),
    padding: theme.spacing(2),
  },
}));
