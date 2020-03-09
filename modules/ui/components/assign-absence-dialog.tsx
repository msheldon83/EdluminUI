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
  title: string;
  message: string;
  onClose: () => void;
  onAssign?: () => void;
};

export const AssignAbsenceDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{props.title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>{props.message}</Typography>
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("Cancel")}
        </TextButton>
        {props.onAssign && (
          <ButtonDisableOnClick
            variant="outlined"
            onClick={props.onAssign}
            className={classes.cancel}
          >
            {t("Ignore & Continue")}
          </ButtonDisableOnClick>
        )}
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
}));
