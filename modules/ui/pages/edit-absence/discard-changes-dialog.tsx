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
  onClose: () => void;
  onCancel: () => void;
};

export const DiscardChangesDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Discard Changes")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t("Are you sure you would like to discard any unsaved changes?")}
        </Typography>
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={props.onCancel}
          className={classes.delete}
        >
          {t("Discard Changes")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  removeSub: {
    paddingTop: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  delete: { color: theme.customColors.blue },
}));
