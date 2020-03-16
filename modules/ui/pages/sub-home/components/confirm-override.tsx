import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  makeStyles,
  Divider,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";

type Props = {
  open?: boolean;
  vacancyId: string | null;
  setOverrideDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onAccept: (
    vacancyId: string,
    unavailableToWork?: boolean,
    overridePreferred?: boolean
  ) => Promise<void>;
};

export const ConfirmOverrideDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Dialog
      open={props.open ?? false}
      onClose={() => props.setOverrideDialogOpen!(false)}
    >
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Accept Absence")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t(
            "This assignment is in conflict with a day/time you previously specified you were not available. Are you sure you want to accept it?"
          )}
        </Typography>
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton
          onClick={() => props.setOverrideDialogOpen!(false)}
          className={classes.buttonSpacing}
        >
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={() => props.onAccept(props.vacancyId ?? "", true, true)}
        >
          {t("Accept")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
}));
