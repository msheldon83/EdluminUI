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
  orgUserName: string;
  onClose: () => void;
  onRemoveOnInactivate: () => void;
  onDontRemoveOnInactivate: () => void;
};

export const RemoveFutureAssignmentsDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Inactivate")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t(
            `Would you like inactivate ${props.orgUserName} and remove them from all future assignments?`
          )}
        </Typography>
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("Cancel")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={props.onDontRemoveOnInactivate}
          className={classes.noButton}
        >
          {t("No, just inactivate")}
        </ButtonDisableOnClick>
        <ButtonDisableOnClick
          variant="contained"
          onClick={props.onRemoveOnInactivate}
        >
          {t("Yes")}
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
  noButton: { color: theme.customColors.darkRed },
  yesButton: { color: theme.customColors.primary },
}));
