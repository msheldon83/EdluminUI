import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import {
  EmployeeAbsScheduleRoute,
  EmployeeAbsScheduleListViewRoute,
  EmployeeAbsScheduleCalendarViewRoute,
} from "ui/routes/people";
import { AbsenceSchedule } from "ui/components/absence/absence-schedule";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { PeopleRoute } from "ui/routes/people";
import { Redirect } from "react-router";
import { useMemo } from "react";
import { parseISO } from "date-fns";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

type Props = {
  view: "list" | "calendar";
};

export const EmployeeAbsenceSchedulePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(EmployeeAbsScheduleRoute);
  const { openSnackbar } = useSnackbar();

  const [deleteAbsence] = useMutationBundle(DeleteAbsence, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetEmployeeAbsenceSchedule"],
  });

  const cancelAbsence = async (absenceId: string) => {
    const result = await deleteAbsence({
      variables: {
        absenceId: absenceId,
      },
    });
  };

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  const orgUserCreatedDate = useMemo(() => {
    if (!orgUser || !orgUser.createdUtc) {
      return undefined;
    }

    const orgUserCreatedDate = parseISO(orgUser.createdUtc);
    return orgUserCreatedDate;
  }, [orgUser]);

  if (getOrgUser.state === "LOADING") {
    return <></>;
  }

  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  return (
    <div>
      {orgUser && orgUserCreatedDate && (
        <AbsenceSchedule
          view={props.view}
          employeeId={params.orgUserId}
          orgId={params.organizationId}
          cancelAbsence={cancelAbsence}
          pageTitle={`${orgUser.firstName} ${orgUser.lastName}'s Schedule`}
          calendarViewRoute={EmployeeAbsScheduleCalendarViewRoute.generate(
            params
          )}
          listViewRoute={EmployeeAbsScheduleListViewRoute.generate(params)}
          actingAsEmployee={false}
          userCreatedDate={orgUserCreatedDate}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
}));
