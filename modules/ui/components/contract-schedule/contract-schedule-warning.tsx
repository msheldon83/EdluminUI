import * as React from "react";
import { useMemo } from "react";
import { useAllSchoolYears } from "reference-data/school-years";
import { ContractScheduleWarningSingleSchoolYear } from "./contract-schedule-warning-single-schoolyear";
import { addMonths, isAfter, isBefore, parseISO } from "date-fns";

type Props = {
  orgId: string;
};

export const ContractScheduleWarning: React.FC<Props> = props => {
  const oneMonthsFromNow = useMemo(() => addMonths(new Date(), 1), []);

  const allSchoolYears = useAllSchoolYears(props.orgId);
  const currentSchoolYear = useMemo(
    () => allSchoolYears.find(x => x.isCurrentSchoolYear),
    [allSchoolYears]
  );

  const nextSchoolYear = useMemo(
    () =>
      allSchoolYears.find(
        x =>
          !x.isCurrentSchoolYear &&
          isAfter(oneMonthsFromNow, parseISO(x.startDate)) &&
          isBefore(oneMonthsFromNow, parseISO(x.endDate))
      ),
    [allSchoolYears, oneMonthsFromNow]
  );

  return (
    <>
      {currentSchoolYear && (
        <ContractScheduleWarningSingleSchoolYear
          orgId={props.orgId}
          schoolYear={currentSchoolYear}
        />
      )}
      {nextSchoolYear && (
        <ContractScheduleWarningSingleSchoolYear
          orgId={props.orgId}
          schoolYear={nextSchoolYear}
        />
      )}
    </>
  );
};
