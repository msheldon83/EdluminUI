import { makeStyles, Typography, Button, Divider } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { Can } from "ui/components/auth/can";
import { canAssignSub } from "helpers/permissions";
import { AssignmentDialog } from "./assignment-dialog";
import { AssignmentWithDetails, VacancySummaryDetail } from "./types";
import { useIsCurrentlyMounted } from "hooks/use-is-currently-mounted";

type Props = {
  assignmentStartTime: Date;
  assignmentWithDetails: AssignmentWithDetails;
  isExistingVacancy: boolean;
  onAssignClick?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<void>;
  disableActions?: boolean;
};

export const UnfilledBanner: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isCurrentlyMounted = useIsCurrentlyMounted();
  const {
    onAssignClick,
    assignmentStartTime,
    assignmentWithDetails,
    isExistingVacancy,
    disableActions = false,
  } = props;

  const [assignmentDialogIsOpen, setAssignmentDialogIsOpen] = React.useState<
    boolean
  >(false);
  const onLocalAssignClick = React.useCallback(async () => {
    if (!onAssignClick) {
      return;
    }

    if (assignmentWithDetails.vacancySummaryDetails.length === 1) {
      // Assigning a single vacancy detail, no need to prompt the user
      await onAssignClick(assignmentWithDetails.vacancySummaryDetails);
    } else {
      // Assigning multiple vacancy details, want to ask the user what they want to do
      setAssignmentDialogIsOpen(true);
    }
  }, [onAssignClick, assignmentWithDetails]);

  return (
    <>
      {onAssignClick && (
        <AssignmentDialog
          action={isExistingVacancy ? "assign" : "pre-arrange"}
          onSubmit={onAssignClick}
          onClose={() => isCurrentlyMounted && setAssignmentDialogIsOpen(false)}
          open={assignmentDialogIsOpen}
          vacancySummaryDetails={assignmentWithDetails.vacancySummaryDetails}
        />
      )}
      <Divider className={classes.divider} />
      <div className={classes.unfilled}>
        <Typography variant={"h6"}>{t("Unfilled")}</Typography>
        {onAssignClick && (
          <Can
            do={(
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string,
              forRole?: Role | null | undefined
            ) =>
              canAssignSub(
                assignmentStartTime,
                permissions,
                isSysAdmin,
                orgId,
                forRole
              )
            }
          >
            <Button
              variant="outlined"
              onClick={onLocalAssignClick}
              disabled={disableActions}
              className={classes.assignButton}
            >
              {isExistingVacancy ? t("Assign") : t("Pre-arrange")}
            </Button>
          </Can>
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
