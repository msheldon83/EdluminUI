import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Divider,
  Button,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  orgName: string;
  isOpen: boolean;
  hasValidData: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const GoLiveDialog: React.FC<Props> = ({
  orgName,
  isOpen,
  hasValidData,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog open={isOpen && hasValidData} onClose={onCancel}>
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {`${t("Are you sure you want to set ")}${orgName}${t(" live?")}`}
        </Typography>
      </DialogTitle>
      <Divider className={classes.divider} />
      <DialogActions>
        <Button variant="contained" onClick={onCancel}>
          {t("No")}
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          {t("Yes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles(theme => ({
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
  },
}));
