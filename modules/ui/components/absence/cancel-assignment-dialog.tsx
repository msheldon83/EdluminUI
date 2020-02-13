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
import { VacancyDetailsGroup } from "./helpers";
import { useState, useCallback, useMemo, useEffect } from "react";
import { flatMap, uniq } from "lodash-es";
import { format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  onCancelAssignment: (
    assignmentId: string,
    assignmentRowVersion: string,
    vacancyDetailIds: string[]
  ) => Promise<void>;
  assignmentId: string;
  allDetailGroups: VacancyDetailsGroup[];
};

export const CancelAssignmentDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selection, setSelection] = useState<"all" | "select">("select");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const { assignmentId, onCancelAssignment, allDetailGroups } = props;

  const getRelevantDates = useCallback(() => {
    const relevantGroups = allDetailGroups.filter(
      d => d.assignmentId === assignmentId
    );
    const allDates = uniq(
      flatMap(relevantGroups.map(g => g.detailItems.map(di => di.date)))
    );
    return allDates;
  }, [allDetailGroups, assignmentId]);

  const subFirstName = useMemo(() => {
    const matchingGroup = allDetailGroups.find(
      d => d.assignmentId === assignmentId
    );
    return matchingGroup?.assignmentEmployeeFirstName;
  }, [assignmentId, allDetailGroups]);

  const subLastName = useMemo(() => {
    const matchingGroup = allDetailGroups.find(
      d => d.assignmentId === assignmentId
    );
    return matchingGroup?.assignmentEmployeeLastName;
  }, [assignmentId, allDetailGroups]);

  const onRemoveClick = useCallback(async () => {
    // Figure out which groups are relevant to us
    const relevantGroups = allDetailGroups.filter(
      d => d.assignmentId === assignmentId
    );

    // Figure out which Vacancy Details were selected through the date selections
    const vacancyDetailIds = flatMap(
      relevantGroups.map(g =>
        g.detailItems
          .filter(di => selectedDates.includes(di.date) && di.vacancyDetailId)
          .map(di => di.vacancyDetailId!)
      )
    );

    await onCancelAssignment(
      assignmentId ?? "0",
      relevantGroups[0]?.assignmentRowVersion ?? "",
      vacancyDetailIds
    );
  }, [allDetailGroups, selectedDates, onCancelAssignment, assignmentId]);

  const detailsDisplay = useMemo(() => {
    const dates = getRelevantDates();
    return dates.map((d, i) => {
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
  }, [getRelevantDates, selectedDates, setSelectedDates, selection]);

  const missingFirstNameBackup = t("the Substitute");

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {subFirstName && subLastName
            ? `${t("Remove")} ${subFirstName} ${subLastName}`
            : t("Remove Substitute")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t(
            "Would you like to remove {{firstName}} from the entire assignment or only select days?",
            { firstName: subFirstName ?? missingFirstNameBackup }
          )}
        </Typography>
        <RadioGroup
          value={selection}
          onChange={e => {
            setSelection(e.target.value === "all" ? "all" : "select");
            if (e.target.value === "all") {
              setSelectedDates(getRelevantDates());
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
