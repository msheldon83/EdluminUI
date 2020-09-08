import {
  Dialog,
  DialogActions,
  DialogContent,
  makeStyles,
  Button,
  Typography,
  Divider,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "@material-ui/icons";
import { useIsMobile } from "hooks";

type Props = {
  open: boolean;
  onClose: () => void;
  assignmentId?: string | null;
};

export const AcceptResultDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <Dialog open={props.open} onClose={() => props.onClose()}>
      <DialogContent className={classes.dialog}>
        {props.assignmentId ? (
          <div
            className={isMobile ? classes.mobileContainer : classes.container}
          >
            <Typography className={classes.subTitle}>
              {t("It's all yours!")}
            </Typography>
            <Typography variant="h5">{`${t("Confirmation")} #C${
              props.assignmentId
            }`}</Typography>
            <CheckCircle className={classes.checkIcon} />
          </div>
        ) : (
          <div
            className={isMobile ? classes.mobileContainer : classes.container}
          >
            <Typography variant="h5">
              {t("We're sorry, this assignment")}
            </Typography>
            <Typography variant="h5">{t("is no longer available")}</Typography>
          </div>
        )}
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <Button variant="contained" onClick={() => props.onClose()}>
          {t("Return to search")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  mobileContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 200,
    width: 375,
  },
  dialog: {
    padding: theme.spacing(2),
  },
  typography: {
    padding: theme.spacing(2),
  },
  subTitle: {
    fontSize: theme.typography.fontSize,
  },
  checkIcon: {
    color: "#099E47",
    fontSize: "3em",
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
  },
}));
