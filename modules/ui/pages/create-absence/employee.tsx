import { isValid, parseISO } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { DayPart, NeedsReplacement } from "graphql/server-types.gen";
import { useQueryParams } from "hooks/query-params";
import { includes, values } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { useGetEmployee } from "reference-data/employee";
import { useIsAdmin } from "reference-data/is-admin";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { CreateAbsenceUI } from "./ui";

type Props = {};

export const EmployeeCreateAbsence: React.FC<Props> = props => {
  const [defaultOptions] = useQueryParams({
    dates: "",
    absenceReason: "",
    dayPart: "",
    needsReplacement: "",
    start: "",
    end: "",
  });
  const initialData = useMemo(() => parseOptions(defaultOptions), [
    defaultOptions,
  ]);

  const potentialEmployees = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  const employee = useGetEmployee();

  const userIsAdmin = useIsAdmin();
  if (
    (potentialEmployees.state !== "DONE" &&
      potentialEmployees.state !== "UPDATING") ||
    userIsAdmin === null
  ) {
    return <></>;
  }

  if (!employee) {
    throw new Error("The user is not an employee");
  }

  return (
    <CreateAbsenceUI
      {...initialData}
      firstName={employee.firstName}
      lastName={employee.lastName}
      employeeId={employee.id}
      actingAsEmployee
      organizationId={employee.orgId.toString()}
      userIsAdmin={userIsAdmin}
      needsReplacement={
        employee.primaryPosition?.needsReplacement ?? NeedsReplacement.No
      }
      positionName={employee.primaryPosition?.name}
      positionId={employee.primaryPosition?.id}
    />
  );
};

function parseOptions(opts: {
  dates: string;
  absenceReason: string;
  dayPart: string;
  needsReplacement: string;
  start: string;
  end: string;
}) {
  let initialDates: Date[] | undefined;
  let initialAbsenceReason: string | undefined;
  let initialDayPart: DayPart | undefined;
  let initialStartHour: Date | undefined;
  let initialEndHour: Date | undefined;
  if (includes(values(DayPart), opts.dayPart.toUpperCase())) {
    initialDayPart = opts.dayPart as DayPart;
  }
  const initialNeedsReplacement: boolean | undefined = ({
    true: true,
    false: false,
  } as Record<string, boolean>)[opts.needsReplacement];
  try {
    initialDates = opts.dates
      .split(",")
      .map(d => parseISO(d))
      .filter(isValid);
    if (initialDates.length <= 0) initialDates = undefined;
    if (opts.absenceReason !== "") {
      initialAbsenceReason = opts.absenceReason;
    }
    initialStartHour = parseISO(opts.start);
    if (!isValid(initialStartHour)) initialStartHour = undefined;
    initialEndHour = parseISO(opts.end);
    if (!isValid(initialEndHour)) initialEndHour = undefined;
  } catch (e) {}
  return {
    initialDates,
    initialAbsenceReason,
    initialDayPart,
    initialStartHour,
    initialEndHour,
    initialNeedsReplacement,
  };
}
