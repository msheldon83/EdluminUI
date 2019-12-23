import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { useTranslation } from "react-i18next";
import { useGetEmployee } from "reference-data/employee";
import { useRouteParams } from "ui/routes/definition";
import {
  PersonAbsScheduleRoute,
  PersonAbsScheduleListViewRoute,
  PersonAbsScheduleCalendarViewRoute,
} from "ui/routes/people";
import { AbsenceSchedule } from "ui/components/absence/absence-schedule";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { PeopleRoute } from "ui/routes/people";
import { Redirect } from "react-router";

type Props = {
  view: "list" | "calendar";
};

export const PersonAbsenceSchedulePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  //const params = useRouteParams(EmployeeScheduleRoute);
  const employee = useGetEmployee();
  const params = useRouteParams(PersonAbsScheduleRoute);

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  if (getOrgUser.state === "LOADING") {
    return <></>;
  }

  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const employeeName = orgUser.firstName + " " + orgUser.lastName;

  return (
    <div className={classes.pageContainer}>
      {orgUser && (
        <AbsenceSchedule
          view={props.view}
          employeeId={params.orgUserId}
          orgId={params.organizationId}
          pageTitle={employeeName + "'s Schedule"}
          showCreateAbsence={true}
          calendarViewRoute={PersonAbsScheduleCalendarViewRoute.generate(
            params
          )}
          listViewRoute={PersonAbsScheduleListViewRoute.generate(params)}
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
  },
}));
