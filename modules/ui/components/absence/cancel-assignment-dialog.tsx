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
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { VacancyDetailsGroup } from "./helpers";
import { useState, useCallback, useMemo } from "react";
import { flatMap } from "lodash-es";
import { getAbsenceDateRangeDisplayTextWithDayOfWeekForContiguousDates } from "./date-helpers";

type Props = {
  open: boolean;
  onClose: () => void;
  onCancelAssignment: (
    assignmentId: string,
    assignmentRowVersion: string,
    vacancyDetailIds: string[]
  ) => Promise<void>;
  currentAssignmentDetails: VacancyDetailsGroup;
  allAssignmentDetails: VacancyDetailsGroup[];
  disabledDates?: Date[];
};

export const CancelAssignmentDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selection, setSelection] = useState<"single" | "all">("single");

  const {
    currentAssignmentDetails,
    allAssignmentDetails,
    onCancelAssignment,
    disabledDates,
  } = props;

  const onRemoveClick = useCallback(async () => {
    // Figure out which VacancyDetailIds to remove the Assignment from per their selection
    let vacancyDetailIds: string[] = [
      ...currentAssignmentDetails.detailItems
        .filter(di => di.vacancyDetailId)
        .map(di => di.vacancyDetailId!),
    ];
    if (selection === "all") {
      const matchingDetails = allAssignmentDetails.filter(
        x =>
          x.assignmentId &&
          x.assignmentId === currentAssignmentDetails.assignmentId
      );
      vacancyDetailIds = [
        ...flatMap(
          matchingDetails.map(d =>
            d.detailItems
              .filter(di => di.vacancyDetailId)
              .map(di => di.vacancyDetailId!)
          )
        ),
      ];
    }

    await onCancelAssignment(
      currentAssignmentDetails.assignmentId ?? "0",
      currentAssignmentDetails.assignmentRowVersion ?? "",
      vacancyDetailIds
    );
  }, [
    selection,
    onCancelAssignment,
    currentAssignmentDetails,
    allAssignmentDetails,
  ]);

  const buildDetailDisplay = useCallback(
    (detailGroup: VacancyDetailsGroup) => {
      const allDates = detailGroup.detailItems.map(di => di.date);

      const dateRangeDisplay = getAbsenceDateRangeDisplayTextWithDayOfWeekForContiguousDates(
        allDates,
        disabledDates
      );

      const timesAndLocations = detailGroup.simpleDetailItems!.map((d, i) => {
        return (
          <div key={i}>
            {`${d.startTime} - ${d.endTime}`}
            <span className={classes.location}>{d.locationName}</span>
          </div>
        );
      });

      return (
        <div className={classes.detailRow}>
          {dateRangeDisplay}
          {timesAndLocations}
        </div>
      );
    },
    [disabledDates, classes.location, classes.detailRow]
  );

  const currentAssignmentDetailsDisplay = useMemo(() => {
    return buildDetailDisplay(currentAssignmentDetails);
  }, [currentAssignmentDetails, buildDetailDisplay]);

  const allAssignmentDetailsDisplay = useMemo(() => {
    const matchingDetails = allAssignmentDetails.filter(
      x =>
        x.assignmentId &&
        x.assignmentId === currentAssignmentDetails.assignmentId
    );

    return matchingDetails.map((d, i) => {
      return <div key={i}>{buildDetailDisplay(d)}</div>;
    });
  }, [allAssignmentDetails, currentAssignmentDetails, buildDetailDisplay]);

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Remove Substitute")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t(
            "This substitute is filling multiple dates on this Absence. Do you want to remove them from just these dates or the whole Absence?"
          )}
        </Typography>
        <RadioGroup
          value={selection}
          onChange={e =>
            setSelection(e.target.value === "all" ? "all" : "single")
          }
          aria-label="selection"
        >
          <FormControlLabel
            value={"single"}
            control={<Radio />}
            label={"Remove from just these dates"}
          />
          <div className={classes.details}>
            {currentAssignmentDetailsDisplay}
          </div>
          <FormControlLabel
            value={"all"}
            control={<Radio />}
            label={"Remove from whole Absence"}
          />
          <div className={classes.details}>{allAssignmentDetailsDisplay}</div>
        </RadioGroup>
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
  details: {
    marginLeft: theme.spacing(5),
  },
  detailRow: {
    marginBottom: theme.spacing(),
  },
  location: {
    marginLeft: theme.spacing(2),
  },
}));
