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

  return (
    <div className={classes.pageContainer}>
      {employee && (
        <AbsenceSchedule
          view={props.view}
          employeeId={params.orgUserId}
          orgId={params.organizationId}
          pageTitle={"Employee's Name Schedule"}
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
