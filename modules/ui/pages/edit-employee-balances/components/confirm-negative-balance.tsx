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
  onConfirm: () => void;
  onCancel: () => void;
  reasonName: string;
};

export const ConfirmNegativeBalance: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog open={props.open} onClose={props.onCancel}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Negative balance")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {`${t("The")} ${props.reasonName} ${t(
            "reason does not allow negative balances. Are you sure you want to save a negative balance?"
          )}`}
        </Typography>
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onCancel} className={classes.buttonSpacing}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick variant="outlined" onClick={props.onConfirm}>
          {t("Save")}
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
}));
