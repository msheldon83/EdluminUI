import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  orgId: string;
  orgName: string;
  isOpen: boolean;
  hasValidData: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const GoLiveDialog: React.FC<Props> = ({
  orgId,
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
          No
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          Yes
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
