import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useHistory } from "react-router";
import { useMutationBundle } from "graphql/hooks";
import {
  BellScheduleRoute,
  BellScheduleViewRoute,
} from "ui/routes/bell-schedule";
import { useRouteParams } from "ui/routes/definition";
import { TextButton } from "ui/components/text-button";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { DeleteWorkDaySchedule } from "../graphql/delete-workday-schedule.gen";

type Props = {
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
  workDayScheduleId: string;
  workDayScheduleName: string;
  usages: number;
};

export const DeleteDialog: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  workDayScheduleId,
  workDayScheduleName,
  usages,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(BellScheduleViewRoute);

  const [deleteWorkDayScheduleMutation] = useMutationBundle(
    DeleteWorkDaySchedule
  );
  const deleteWorkDaySchedule = React.useCallback(async () => {
    await deleteWorkDayScheduleMutation({
      variables: {
        workDayScheduleId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ["GetAllWorkDaySchedulesWithinOrg"],
    });
    history.push(BellScheduleRoute.generate(params));
  }, [deleteWorkDayScheduleMutation, history, params, workDayScheduleId]);

  const onCancel = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onClose={onCancel}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{`${
          usages > 0 ? "Inactivate" : "Delete"
        } work day schedule?`}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t(
            usages > 0
              ? "This work day schedule is currently in use, and so will merely be inactivated."
              : "This work day schedule is not in use, and so will really, truly be deleted."
          )}
        </Typography>
      </DialogContent>
      <Divider variant="fullWidth" />
      <DialogActions>
        <TextButton onClick={onCancel} className={classes.buttonSpacing}>
          {t("No")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={deleteWorkDaySchedule}
          className={classes.delete}
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
  removeSub: {
    paddingTop: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
  },
  dividedContainer: { display: "flex" },
  delete: { color: theme.customColors.blue },
  header: { textAlign: "center" },
}));
