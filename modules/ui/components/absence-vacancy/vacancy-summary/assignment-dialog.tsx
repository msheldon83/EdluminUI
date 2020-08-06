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
import { format, isEqual } from "date-fns";
import { Assignment, VacancySummaryDetail } from "./types";

type Props = {
  action: "pre-arrange" | "assign" | "reassign" | "cancel";
  vacancySummaryDetails: VacancySummaryDetail[];
  assignment?: Assignment;
  open: boolean;
  onClose: () => void;
  onSubmit: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<boolean | void>;
};

export const AssignmentDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selection, setSelection] = useState<"all" | "select">("all");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const {
    action,
    open,
    onClose,
    assignment,
    vacancySummaryDetails,
    onSubmit,
  } = props;

  const assignedSubName = useMemo(
    () =>
      assignment
        ? `${assignment.employee?.firstName ?? ""} ${assignment.employee
            ?.lastName ?? ""}`
        : undefined,
    [assignment]
  );

  const onSubmitClick = useCallback(async () => {
    const details = vacancySummaryDetails.filter(vsd =>
      selectedDates.includes(vsd.startTimeLocal)
    );
    await onSubmit(details);
    onClose();
  }, [vacancySummaryDetails, selectedDates, onSubmit, onClose]);

  const detailsDisplay = useMemo(() => {
    return vacancySummaryDetails.map((vsd, i) => {
      return (
        <div key={i}>
          <FormControlLabel
            checked={
              selectedDates.includes(vsd.startTimeLocal) || selection === "all"
            }
            disabled={selection === "all"}
            control={
              <Checkbox
                onChange={e => {
                  if (e.target.checked) {
                    // Add to selection list
                    setSelectedDates([...selectedDates, vsd.startTimeLocal]);
                  } else {
                    // Remove from selection list
                    setSelectedDates([
                      ...selectedDates.filter(s =>
                        isEqual(s, vsd.startTimeLocal)
                      ),
                    ]);
                  }
                }}
                color="primary"
              />
            }
            label={`${format(vsd.startTimeLocal, "EEE, MMM d h:mm a")} @ ${
              vsd.locationName
            }`}
          />
        </div>
      );
    });
  }, [vacancySummaryDetails, selectedDates, setSelectedDates, selection]);

  let actionText = "";
  let messagePrompt = "";

  switch (action) {
    case "pre-arrange":
      actionText = t("Pre-arrange");
      messagePrompt = t(
        "Would you like to pre-arrange a substitute for all of the following details or only select ones?"
      );
      break;
    case "assign":
      actionText = t("Assign");
      messagePrompt = t(
        "Would you like to assign a substitute for all of the following details or only select ones?"
      );
      break;
    case "reassign":
      actionText = t("Reassign");
      messagePrompt = assignment?.employee?.firstName
        ? t(
            "Would you like to reassign all of the following details or only select ones from {{firstName}} to another substitute?",
            { firstName: assignment.employee.firstName }
          )
        : t(
            "Would you like to reassign all of the following details or only select ones?"
          );
      break;
    case "cancel":
      actionText = t("Remove");
      messagePrompt = assignment?.employee?.firstName
        ? t(
            "Would you like to remove {{firstName}} from the entire assignment or only select details?",
            { firstName: assignment.employee.firstName }
          )
        : t(
            "Would you like to remove the substitute from the entire assignment or only select details?"
          );
      break;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{`${actionText} ${assignedSubName ??
          ""}`}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography className={classes.message}>{messagePrompt}</Typography>
        <RadioGroup
          value={selection}
          onChange={e => {
            setSelection(e.target.value === "all" ? "all" : "select");
            if (e.target.value === "all") {
              setSelectedDates(
                vacancySummaryDetails.map(vsd => vsd.startTimeLocal)
              );
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
            label={t("Select details")}
          />
          <FormControlLabel
            value={"all"}
            control={<Radio />}
            label={t("All details")}
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
          onClick={onSubmitClick}
          className={[classes.buttonSpacing, classes.remove].join(" ")}
          disabled={selectedDates.length === 0}
        >
          {actionText}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  message: {
    marginBottom: theme.spacing(),
  },
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  remove: { color: theme.customColors.darkRed, marginRight: theme.spacing(2) },
}));
