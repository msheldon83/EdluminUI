import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Button,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  onEditDay: () => void;
  onEditEvent: () => void;
  onDeleteDay: () => Promise<void>;
  onDeleteEvent: () => Promise<void>;
  date: Date;
  forDelete?: boolean;
};

export const EditSignleDayDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [isDeleting, setIsDeleting] = React.useState(false);

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {t("This calendar event spans multiple days")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {props.forDelete
            ? `${t("Do you want to only delete")} ${format(
                props.date,
                "MMM d"
              )} ?`
            : `${t("Do you want to only edit")} ${format(
                props.date,
                "MMM d"
              )} ?`}
        </Typography>
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions className={classes.actionButtons}>
        {!isDeleting && (
          <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
            {t("Cancel")}
          </TextButton>
        )}
        {props.forDelete && !isDeleting && (
          <>
            <Button
              variant="outlined"
              onClick={async () => {
                setIsDeleting(true);
                await props.onDeleteEvent();
                setIsDeleting(false);
              }}
            >
              {t("Delete event")}
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                setIsDeleting(true);
                await props.onDeleteDay();
                setIsDeleting(false);
              }}
            >
              {t("Delete just this day")}
            </Button>
          </>
        )}
        {props.forDelete && isDeleting && (
          <Typography className={classes.deletingText}>
            {t("Deleting...")}
          </Typography>
        )}
        {!props.forDelete && (
          <>
            <Button variant="outlined" onClick={props.onEditEvent}>
              {t("Edit event")}
            </Button>
            <Button variant="contained" onClick={props.onEditDay}>
              {t("Edit just this day")}
            </Button>
          </>
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
  cancel: { color: theme.customColors.darkRed },
  actionButtons: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  deletingText: {
    marginRight: theme.spacing(2),
  },
}));
