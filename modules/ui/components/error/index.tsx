import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, makeStyles } from "@material-ui/core";
import { useHistory } from "react-router";
import { useIsMobile } from "hooks";

export const ErrorUI: React.FC<{}> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const isMobile = useIsMobile();

  return isMobile ? (
    <div className={classes.container}>
      <div className={classes.mobileContainer}>
        <div className={classes.errorText}>{t("Unexpected error")}</div>
        <div className={classes.mobileText}>
          {t("I hate it when this happens!")}
        </div>
        <div className={classes.mobileSubText}>{t("We'll take a look.")}</div>
        <img src={require("./images/mobileSadCat.svg")} />
        <Button
          variant="contained"
          className={classes.button}
          onClick={() => history.goBack()}
        >
          {t("Go back")}
        </Button>
      </div>
    </div>
  ) : (
    <div className={classes.desktopContainer}>
      <div className={classes.textContainer}>
        <div className={classes.errorText}>{t("Unexpected error")}</div>
        <div className={classes.text}>{t("I hate it when this happens!")}</div>
        <div className={classes.subText}>{t("We'll take a look.")}</div>
        <Button
          variant="contained"
          className={classes.button}
          onClick={() => history.goBack()}
        >
          {t("Go back")}
        </Button>
      </div>
      <img src={require("./images/sadCat.svg")} />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    textAlign: "center",
  },
  mobileContainer: {
    width: "300px",
    textAlign: "center",
    display: "inline-block",
    marginTop: theme.spacing(4),
  },
  desktopContainer: {
    marginTop: theme.spacing(20),
    marginLeft: theme.spacing(5),
    display: "flex",
  },
  textContainer: {
    width: "300px",
  },
  errorText: {
    display: "inline-block",
    color: theme.customColors.black,
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "bold",
    paddingBottom: theme.spacing(2),
    textTransform: "uppercase",
  },
  text: {
    color: theme.customColors.black,
    fontSize: theme.typography.pxToRem(48),
    fontWeight: 600,
    wordWrap: "normal",
  },
  mobileText: {
    color: theme.customColors.black,
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 600,
    wordWrap: "normal",
    width: "160px",
    margin: "0 auto",
  },
  subText: {
    color: theme.customColors.black,
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 600,
    wordWrap: "normal",
    paddingTop: theme.spacing(2),
    paddingBotom: theme.spacing(2),
  },
  mobileSubText: {
    color: theme.customColors.black,
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 600,
    wordWrap: "normal",
    width: "160px",
    margin: "0 auto",
    paddingTop: theme.spacing(2),
    paddingBotom: theme.spacing(2),
  },
  button: {
    display: "inline-block",
    backgroundColor: theme.customColors.black,
    marginTop: theme.spacing(2),
  },
}));
