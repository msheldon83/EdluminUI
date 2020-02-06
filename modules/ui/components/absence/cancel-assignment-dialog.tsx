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
import { useState, useCallback } from "react";
import { flatMap } from "lodash-es";

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
};

export const CancelAssignmentDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selection, setSelection] = useState<"single" | "all">("single");

  const {
    currentAssignmentDetails,
    allAssignmentDetails,
    onCancelAssignment,
  } = props;

  const onCancelClick = useCallback(async () => {
    // Figure out which VacancyDetailIds to remove the Assignment from per their selection
    let vacancyDetailIds: string[] = [
      ...currentAssignmentDetails.detailItems
        .filter(di => di.vacancyDetailId)
        .map(di => di.vacancyDetailId!),
    ];
    if (selection === "all") {
      var matchingDetails = allAssignmentDetails.filter(
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
  }, [onCancelAssignment, currentAssignmentDetails, allAssignmentDetails]);

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Cancel Assignment")}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {t(
            "This substitute is filling multiple dates. Do you want to remove them from just these dates or the whole Absence?"
          )}
        </Typography>
        <RadioGroup
          value={selection}
          onChange={e =>
            setSelection(e.target.value === "all" ? "all" : "single")
          }
          aria-label="selection"
          //className={classes.radioGroup}
        >
          <FormControlLabel
            value={"single"}
            control={<Radio />}
            label={"Remove from just these dates"}
          />
          <FormControlLabel
            value={"all"}
            control={<Radio />}
            label={"Remove from whole Absence"}
          />
        </RadioGroup>
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={onCancelClick}
          className={classes.delete}
        >
          {t("Remove")}
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
  delete: { color: theme.customColors.darkRed },
}));
