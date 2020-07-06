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
import { useMemo } from "react";
import { parseISO } from "date-fns";
import { ShowErrors } from "ui/components/error-helpers";
import { HideAbsence } from "ui/components/employee/graphql/hide-absence.gen";

type Props = {
  view: "list" | "calendar";
};

export const EmployeeSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(EmployeeScheduleRoute);
  const employee = useGetEmployee();

  const employeeCreatedDate = useMemo(() => {
    if (!employee || !employee.createdUtc) {
      return undefined;
    }

    const employeeCreatedDate = parseISO(employee.createdUtc);
    return employeeCreatedDate;
  }, [employee]);

  const [deleteAbsence] = useMutationBundle(DeleteAbsence, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetEmployeeAbsenceSchedule"],
  });

  const [hideAbsence] = useMutationBundle(HideAbsence, {
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

  const onHideAbsence = async (absenceId: string) => {
    const result = await hideAbsence({
      variables: {
        absenceId: absenceId,
      },
    });
  };

  return (
    <div>
      {employee && employeeCreatedDate && (
        <AbsenceSchedule
          view={props.view}
          employeeId={employee?.id}
          orgId={employee?.orgId?.toString()}
          pageTitle={t("My Schedule")}
          cancelAbsence={cancelAbsence}
          hideAbsence={onHideAbsence}
          calendarViewRoute={EmployeeScheduleCalendarViewRoute.generate(params)}
          listViewRoute={EmployeeScheduleListViewRoute.generate(params)}
          actingAsEmployee={true}
          userCreatedDate={employeeCreatedDate}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({}));
