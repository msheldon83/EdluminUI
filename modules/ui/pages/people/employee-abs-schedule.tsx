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
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
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
    <div className={classes.pageContainer}>
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
  pageContainer: {
    display: "block",
    overflowY: "scroll",
    height: "100vh",
    position: "fixed",
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(15),
  },
}));
