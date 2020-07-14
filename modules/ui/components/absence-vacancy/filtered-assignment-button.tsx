import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { Can } from "ui/components/auth/can";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canAssignSub } from "helpers/permissions";
import { endOfTomorrow, min, setSeconds, isToday, isFuture } from "date-fns";

type Props = {
  details: {
    id: string | undefined;
    date: Date;
    startTime: number;
  }[];
  buttonText: string;
  onClick: (detailIds: string[]) => void;
  disableAssign: boolean;
};

export const FilteredAssignmentButton: React.FC<Props> = ({
  details,
  buttonText
  disableAssign,
  onClick,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

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
      forRole
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
      forRole
    );

  const PreArrangeButton: React.FC<{ detailIds: string[] }> = ({
    detailIds,
  }) => (
    <Button
      variant="outlined"
      disabled={disableAssign}
      className={classes.preArrangeButton}
      onClick={() => onClick(detailIds)}
    >
      {buttonText}
    </Button>
  );

  return (
    <>
      <Can do={allDetailPerms}>
        <PreArrangeButton detailIds={details.map(d => d.id ?? "")} />
      </Can>
      <Can not do={allDetailPerms}>
        <Can do={futureDetailPerms}>
          <PreArrangeButton detailIds={futureDetails.map(d => d.id ?? "")} />
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
