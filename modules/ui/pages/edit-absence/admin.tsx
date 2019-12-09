import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { useQueryBundle } from "graphql/hooks";
import { GetAbsence } from "./graphql/get-absence.gen";
import { useIsAdmin } from "reference-data/is-admin";
import { EditAbsenceUI } from "./ui";
import { NeedsReplacement } from "graphql/server-types.gen";
import { VacancyDetail } from "../create-absence/types";
import { compact, flatMap, isNil } from "lodash-es";
import { useMemo } from "react";
import { AbsenceReasonUsageData } from "helpers/absence/computeAbsenceUsageText";

export const EditAbsence: React.FC = () => {
  const params = useRouteParams(AdminEditAbsenceRoute);
  const userIsAdmin = useIsAdmin();

  const absence = useQueryBundle(GetAbsence, {
    variables: {
      id: params.absenceId,
    },
  });

  const initialVacancyDetails: VacancyDetail[] = useMemo(() => {
    if (absence.state !== "DONE") {
      return [];
    }
    return compact(
      // @ts-ignore
      flatMap(absence.data.absence?.byId.vacancies ?? [], v => {
        // @ts-ignore
        return v.details.map(d => {
          if (!d) return null;
          return {
            date: d.startDate,
            startTime: d.startTimeLocal,
            endTime: d.endTimeLocal,
            locationId: d.locationId!,
          };
        });
      })
    );
  }, [absence]);

  if (absence.state !== "DONE") {
    return <></>;
  }
  if (userIsAdmin === null) return <></>;
  // @ts-ignore - I think I've found a bug in typescript?
  const data = absence.data?.absence?.byId;
  // @ts-ignore
  const vacancies = compact(data?.vacancies ?? []);
  const vacancy = vacancies[0];
  const position = vacancy?.position;
  const employee = data?.employee;
  // @ts-ignore
  const details = data?.details ?? [];
  const detail = details[0];
  // @ts-ignore
  const reasonUsage = detail?.reasonUsages[0];
  // @ts-ignore
  const dayPart = detail?.dayPartId ?? undefined;

  const processedUsage: AbsenceReasonUsageData[] = (() => {
    const usages = flatMap(details, (d => d?.reasonUsages) ?? []) ?? [];
    return usages.reduce((p, u) => {
      if (u && u.absenceReasonTrackingTypeId && !isNil(u.amount)) {
        return [
          ...p,
          {
            amount: u.amount,
            absenceReasonTrackingTypeId: u.absenceReasonTrackingTypeId,
          },
        ];
      }
      return p;
    }, [] as AbsenceReasonUsageData[]);
  })();

  if (!data || !vacancy || !position || !employee || !detail || !reasonUsage) {
    return <></>;
  }

  return (
    <EditAbsenceUI
      firstName={employee.firstName}
      lastName={employee.lastName}
      employeeId={employee.id.toString()}
      needsReplacement={position.needsReplacement ?? NeedsReplacement.No}
      userIsAdmin={userIsAdmin}
      positionId={position.id}
      positionName={position.name}
      organizationId={data.organization.id}
      absenceReasonId={reasonUsage?.absenceReasonId}
      absenceId={data.id}
      startDate={data.startDate!}
      endDate={data.endDate!}
      dayPart={dayPart}
      initialVacancyDetails={initialVacancyDetails}
      /* cf 2019-12-06 -
      it is impossible to satisfy the graphql type Vacancy, because it is impossible to
      satisfy the graphql type Organization, because it is infinitely recursive.  */
      initialVacancies={vacancies as any}
      initialAbsenceUsageData={processedUsage}
    />
  );
};
