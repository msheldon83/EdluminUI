import { makeStyles } from "@material-ui/styles";
import { useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useGetEmployee } from "reference-data/employee";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  EmployeeScheduleCalendarViewRoute,
  EmployeeScheduleListViewRoute,
  EmployeeScheduleRoute,
} from "ui/routes/employee-schedule";
import { AbsenceSchedule } from "ui/components/absence/absence-schedule";

type Props = {
  view: "list" | "calendar";
};

export const EmployeeSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(EmployeeScheduleRoute);
  const employee = useGetEmployee();

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
  });

  const cancelAbsence = async (absenceId: string) => {
    const result = await deleteAbsence({
      variables: {
        absenceId: absenceId,
      },
    });
  };

  return (
    <div className={classes.pageContainer}>
      {employee && (
        <AbsenceSchedule
          view={props.view}
          employeeId={employee?.id}
          orgId={employee?.orgId?.toString()}
          pageTitle={"My Schedule"}
          cancelAbsence={cancelAbsence}
          calendarViewRoute={EmployeeScheduleCalendarViewRoute.generate(params)}
          listViewRoute={EmployeeScheduleListViewRoute.generate(params)}
          isAdmin={false}
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
