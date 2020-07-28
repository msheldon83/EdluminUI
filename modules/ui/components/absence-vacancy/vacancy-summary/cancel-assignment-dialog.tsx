import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { useState, useCallback, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { AssignmentWithDetails } from "./types";
import { compact } from "lodash-es";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  open: boolean;
  onClose: () => void;
  onCancelAssignment: (
    vacancyDetailIds: string[],
    vacancyDetailDates?: Date[]
  ) => Promise<boolean>;
};

export const CancelAssignmentDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selection, setSelection] = useState<"all" | "select">("select");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const { open, onClose, assignmentWithDetails, onCancelAssignment } = props;

  const assignment = useMemo(() => assignmentWithDetails.assignment!, [
    assignmentWithDetails,
  ]);
  const subName = useMemo(
    () =>
      `${assignment.employee?.firstName ?? ""} ${assignment.employee
        ?.lastName ?? ""}`,
    [assignment]
  );

  const onRemoveClick = useCallback(async () => {
    // Find the Vacancy Details Ids that are on the selected dates
    const vacancyDetailIds = selectedDates.reduce(
      (accumulator: string[], date) => {
        accumulator.push(
          ...(assignmentWithDetails.vacancyDetailIdsByDate.find(vd =>
            isSameDay(vd.date, date)
          )?.vacancyDetailIds ?? [])
        );
        return accumulator;
      },
      []
    );

    await onCancelAssignment(compact(vacancyDetailIds), compact(selectedDates));
    onClose();
  }, [assignmentWithDetails, selectedDates, onCancelAssignment, onClose]);

  const detailsDisplay = useMemo(() => {
    return assignmentWithDetails.dates.map((d, i) => {
      return (
        <div key={i}>
          <FormControlLabel
            checked={selectedDates.includes(d)}
            disabled={selection === "all"}
            control={
              <Checkbox
                onChange={e => {
                  if (e.target.checked) {
                    // Add to selection list
                    setSelectedDates([...selectedDates, d]);
                  } else {
                    // Remove from selection list
                    setSelectedDates([...selectedDates.filter(s => s !== d)]);
                  }
                }}
                color="primary"
              />
            }
            label={format(d, "EEE, MMM d")}
          />
        </div>
      );
    });
  }, [assignmentWithDetails, selectedDates, setSelectedDates, selection]);

  const warningMessagePrompt = assignment.employee?.firstName
    ? t(
        "Would you like to remove {{firstName}} from the entire assignment or only select days?",
        { firstName: assignment.employee.firstName }
      )
    : t(
        "Would you like to remove the substitute from the entire assignment or only select days?"
      );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{`${t("Remove")} ${subName}`}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>{warningMessagePrompt}</Typography>
        <RadioGroup
          value={selection}
          onChange={e => {
            setSelection(e.target.value === "all" ? "all" : "select");
            if (e.target.value === "all") {
              setSelectedDates(assignmentWithDetails.dates);
            } else {
              setSelectedDates([]);
            }
          }}
          aria-label="selection"
          row
        >
          <FormControlLabel
            value={"select"}
            control={<Radio />}
            label={"Select days"}
          />
          <FormControlLabel
            value={"all"}
            control={<Radio />}
            label={"Entire assignment"}
          />
        </RadioGroup>
        <div>{detailsDisplay}</div>
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={onRemoveClick}
          className={[classes.buttonSpacing, classes.remove].join(" ")}
          disabled={selectedDates.length === 0}
        >
          {t("Remove")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  remove: { color: theme.customColors.darkRed, marginRight: theme.spacing(2) },
}));
