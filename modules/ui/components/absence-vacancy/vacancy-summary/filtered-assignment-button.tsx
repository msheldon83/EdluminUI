import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { Can } from "ui/components/auth/can";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { endOfTomorrow, min, isToday, isFuture } from "date-fns";
import { VacancySummaryDetail, AssignmentAction, Assignment } from "./types";
import { AssignmentDialog } from "./assignment-dialog";
import { useIsCurrentlyMounted } from "hooks/use-is-currently-mounted";
import { useTranslation } from "react-i18next";
import { getActionButtonText } from "./helpers";

type Props = {
  details: VacancySummaryDetail[];
  assignment?: Assignment;
  action: AssignmentAction;
  onClick: (vacancySummaryDetails: VacancySummaryDetail[]) => void;
  disableAction: boolean;
  permissionCheck: (
    absDate: Date,
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) => boolean;
};

export const FilteredAssignmentButton: React.FC<Props> = ({
  details,
  assignment,
  action,
  disableAction,
  onClick,
  permissionCheck,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isCurrentlyMounted = useIsCurrentlyMounted();

  const futureDetails = details.filter(d => {
    return isToday(d.startTimeLocal) || isFuture(d.startTimeLocal);
  });

  const allDetailPerms = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    permissionCheck(
      details.reduce(
        (acc, detail) => min([acc, detail.startTimeLocal]),
        endOfTomorrow()
      ),
      permissions,
      isSysAdmin,
      orgId,
      forRole
    );

  const futureDetailPerms = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    futureDetails.length > 0 &&
    permissionCheck(
      futureDetails[0].startTimeLocal,
      permissions,
      isSysAdmin,
      orgId,
      forRole
    );

  const [assignmentDialogIsOpen, setAssignmentDialogIsOpen] = React.useState<
    boolean
  >(false);
  const onLocalActionClick = React.useCallback(
    (details: VacancySummaryDetail[]) => {
      if (details.length === 1) {
        // Taking action on a single vacancy detail, no need to prompt the user
        onClick(details);
      } else {
        // Taking action on multiple vacancy details, want to ask the user what they want to do
        setAssignmentDialogIsOpen(true);
      }
    },
    [onClick]
  );

  const ActionButton: React.FC<{ details: VacancySummaryDetail[] }> = ({
    details,
  }) => (
    <Button
      variant="outlined"
      disabled={disableAction}
      className={classes.actionButton}
      onClick={() => onLocalActionClick(details)}
    >
      {getActionButtonText(action, t)}
    </Button>
  );

  const ActionDialog: React.FC<{ details: VacancySummaryDetail[] }> = ({
    details,
  }) => (
    <AssignmentDialog
      action={action}
      onSubmit={async (vacancySummaryDetails: VacancySummaryDetail[]) =>
        onClick(vacancySummaryDetails)
      }
      onClose={() => isCurrentlyMounted && setAssignmentDialogIsOpen(false)}
      open={assignmentDialogIsOpen}
      vacancySummaryDetails={details}
      assignment={assignment}
    />
  );

  return (
    <>
      <Can do={allDetailPerms}>
        <ActionDialog details={details} />
        <ActionButton details={details} />
      </Can>
      <Can not do={allDetailPerms}>
        <Can do={futureDetailPerms}>
          <ActionDialog details={futureDetails} />
          <ActionButton details={futureDetails} />
        </Can>
      </Can>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  actionButton: {
    marginRight: theme.spacing(2),
  },
}));
