import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { useQueryBundle } from "graphql/hooks";
import { GetAbsence } from "./graphql/get-absence.gen";
import { useIsAdmin } from "reference-data/is-admin";
import { EditAbsenceUI } from "./ui";
import { NeedsReplacement } from "graphql/server-types.gen";
import { VacancyDetail } from "../create-absence/types";
import { compact } from "lodash-es";
import { useMemo } from "react";

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
      (absence.data.absence?.byId.vacancies ?? []).map(d => {
        /* this will need to be updated once vacancies can have multiple details */
        // @ts-ignore
        const details = d?.details[0];
        if (!details) return null;
        return {
          date: details.startDate,
          startTime: details.startTimeLocal,
          endTime: details.endTimeLocal,
          locationId: details.locationId!,
        };
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
  const detail = data?.details[0];
  // @ts-ignore
  const reasonUsage = detail?.reasonUsages[0];
  // @ts-ignore
  const dayPart = detail?.dayPartId ?? undefined;

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
    />
  );
};
