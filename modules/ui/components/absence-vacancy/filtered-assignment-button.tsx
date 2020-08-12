import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { Can } from "ui/components/auth/can";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canAssignSub } from "helpers/permissions";
import { endOfTomorrow, min, setSeconds, isToday, isFuture } from "date-fns";
import { compact } from "lodash-es";

type Props = {
  details: {
    id: string | undefined;
    date: Date;
    startTime: number;
  }[];
  buttonText: string;
  onClick: (detailIds: string[], dates: Date[]) => void;
  disableAssign: boolean;
  isApprovedForSubJobSearch: boolean;
};

export const FilteredAssignmentButton: React.FC<Props> = ({
  details,
  buttonText,
  disableAssign,
  onClick,
  isApprovedForSubJobSearch,
}) => {
  const classes = useStyles();

  const futureDetails = details.filter(d => {
    const startDateTime = setSeconds(d.date, d.startTime);
    return isToday(startDateTime) || isFuture(startDateTime);
  });

  const allDetailPerms = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    canAssignSub(
      details.reduce(
        (acc, detail) => min([acc, setSeconds(detail.date, detail.startTime)]),
        endOfTomorrow()
      ),
      permissions,
      isSysAdmin,
      orgId,
      forRole,
      isApprovedForSubJobSearch
    );

  const futureDetailPerms = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    futureDetails.length > 0 &&
    canAssignSub(
      setSeconds(futureDetails[0].date, futureDetails[0].startTime),
      permissions,
      isSysAdmin,
      orgId,
      forRole,
      isApprovedForSubJobSearch
    );

  const PreArrangeButton: React.FC<{ detailIds: string[]; dates: Date[] }> = ({
    detailIds,
    dates,
  }) => (
    <Button
      variant="outlined"
      disabled={disableAssign}
      className={classes.preArrangeButton}
      onClick={() => onClick(detailIds, dates)}
    >
      {buttonText}
    </Button>
  );

  return (
    <>
      <Can do={allDetailPerms}>
        <PreArrangeButton
          detailIds={compact(details.map(d => d.id))}
          dates={details.map(d => d.date)}
        />
      </Can>
      <Can not do={allDetailPerms}>
        <Can do={futureDetailPerms}>
          <PreArrangeButton
            detailIds={compact(futureDetails.map(d => d.id))}
            dates={futureDetails.map(d => d.date)}
          />
        </Can>
      </Can>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  preArrangeButton: {
    marginRight: theme.spacing(2),
  },
}));
