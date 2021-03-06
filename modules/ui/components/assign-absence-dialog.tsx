import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";

type Props = {
  open: boolean;
  messages: string[];
  employeeToAssign: string;
  onClose: () => void;
  onAssign?: () => void;
};

export const AssignAbsenceDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {t("There was an issue assigning {{employeeToAssign}}", {
            employeeToAssign: props.employeeToAssign,
          })}
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogBox}>
        {props.messages && props.messages.length === 0 ? (
          <div>{t("No Warning Messages")}</div>
        ) : (
          props.messages.map((n, i) => (
            <div key={i} className={classes.padding}>
              {n}
            </div>
          ))
        )}
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("Cancel")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={props.onAssign}
          className={classes.cancel}
        >
          {t("Ignore & Continue")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  cancel: { color: theme.customColors.blue },
  padding: {
    padding: theme.typography.pxToRem(5),
  },
  dialogBox: {
    width: theme.typography.pxToRem(500),
  },
}));
