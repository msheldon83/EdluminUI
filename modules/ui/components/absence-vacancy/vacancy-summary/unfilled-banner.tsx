import { makeStyles, Typography, Divider } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentWithDetails, VacancySummaryDetail } from "./types";
import { FilteredAssignmentButton } from "./filtered-assignment-button";
import { canAssignSub } from "helpers/permissions";

type Props = {
  assignmentWithDetails: AssignmentWithDetails;
  assignAction: "assign" | "pre-arrange";
  onAssignClick?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<void>;
  disableActions?: boolean;
};

export const UnfilledBanner: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    onAssignClick,
    assignmentWithDetails,
    assignAction,
    disableActions = false,
  } = props;

  return (
    <>
      <Divider className={classes.divider} />
      <div className={classes.unfilled}>
        <Typography variant={"h6"}>{t("Unfilled")}</Typography>
        {onAssignClick && (
          <FilteredAssignmentButton
            details={assignmentWithDetails.vacancySummaryDetails}
            action={assignAction}
            permissionCheck={canAssignSub}
            disableAction={disableActions}
            onClick={onAssignClick}
            className={classes.assignButton}
          />
        )}
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  unfilled: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    color: theme.customColors.darkRed,
    marginLeft: theme.spacing(8),
  },
  divider: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  assignButton: {
    marginRight: theme.typography.pxToRem(5),
  },
}));
