import * as React from "react";
import { useState, useEffect } from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { PositionEditUI } from "./ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import {
  PeopleEmployeePositionEditRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { GetEmployeePosition } from "./graphql/get-employee-position.gen";
import { SaveEmployeePosition } from "./graphql/save-employee-position.gen";
import { PositionInput } from "graphql/server-types.gen";
import { useHistory } from "react-router";
import { compact } from "lodash-es";
import {
  midnightTime,
  secondsSinceMidnight,
  timeStampToIso,
} from "helpers/time";

type Props = {};

export const EmployeePosition: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PeopleEmployeePositionEditRoute);
  const classes = useStyles();
  const history = useHistory();

  const [positionTypeName, setPositionTypeName] = useState<string | undefined>(
    undefined
  );

  const [saveEmployeePosition] = useMutationBundle(SaveEmployeePosition, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getEmployeePosition = useQueryBundle(GetEmployeePosition, {
    variables: {
      id: params.orgUserId,
    },
  });

  const orgUser =
    getEmployeePosition.state === "LOADING"
      ? undefined
      : getEmployeePosition?.data?.orgUser?.byId;

  useEffect(
    () =>
      setPositionTypeName(
        orgUser?.employee?.primaryPosition?.positionType?.name
      ),
    [orgUser]
  );

  if (getEmployeePosition.state === "LOADING" || !orgUser?.employee) {
    return <></>;
  }

  const position = orgUser.employee.primaryPosition;

  const handleSave = async (positionInput: PositionInput) => {
    await saveEmployeePosition({
      variables: {
        employee: {
          id: orgUser.id,
          position: {
            ...positionInput,
            id: position?.id,
            orgId: params.organizationId,
          },
        },
      },
    });
  };

  const handleCancel = () => {
    history.push(PersonViewRoute.generate(params));
  };

  const positionTypeLabel = positionTypeName
    ? `${t("Position")} - ${positionTypeName}`
    : t("Position");

  const positionSchedules = compact(position?.schedules) ?? [];
  const positionSchedule = positionSchedules.map(ps => ({
    id: ps.id,
    periods: ps.items.map(p => ({
      locationId: p.location.id,
      locationGroupId: p.location.locationGroupId,
      bellScheduleId:
        (!p.bellSchedule && p.startTime && p.endTime)
          ? "custom"
          : p.bellSchedule?.id,
      startTime: p.startTime ? timeStampToIso(
        midnightTime().setSeconds(p.startTime)) : undefined,
      endTime: p.endTime ? timeStampToIso(
        midnightTime().setSeconds(p.endTime)) : undefined,
      allDay: p.isAllDay,
      startPeriodId: p.startPeriod?.id,
      endPeriodId: p.endPeriod?.id,
    })),
    daysOfTheWeek: ps.daysOfTheWeek,
  }));

  return (
    <>
      <div className={classes.header}>
        <div className={classes.name}>
          {`${orgUser?.firstName} ${orgUser?.lastName}`}
        </div>
        <Typography variant="h1">{positionTypeLabel}</Typography>
      </div>
      <PositionEditUI
        position={position}
        positionSchedule={
          positionSchedule.length > 0 ? positionSchedule : undefined
        }
        onSave={handleSave}
        onCancel={handleCancel}
        submitLabel={t("Save")}
        setPositionTypeName={setPositionTypeName}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  name: {
    fontSize: theme.typography.pxToRem(24),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
}));
