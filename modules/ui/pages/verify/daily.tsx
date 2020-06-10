import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetVacancyDetails } from "./graphql/get-vacancydetails.gen";
import { useRouteParams } from "ui/routes/definition";
import { useQueryParamIso } from "hooks/query-params";
import { useTranslation } from "react-i18next";
import { Divider, Typography } from "@material-ui/core";
import { VerifyDailyRoute } from "ui/routes/absence-vacancy/verify";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { format } from "date-fns";
import { compact } from "lodash-es";
import { DailyFilters as Filters } from "./components/filters/daily";
import { FilterQueryParams } from "./components/filters/filter-params";
import { VerifyDailyUI } from "./daily-ui";
import { AssignmentRow } from "./types";

export const VerifyDailyPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(VerifyDailyRoute);
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);
  const getVacancyDetails = useQueryBundle(GetVacancyDetails, {
    variables: {
      orgId: params.organizationId,
      includeVerified: filters.showVerified,
      locationIds: filters.locationIds,
      fromDate: filters.date,
      toDate: filters.date,
      shadowFromOrgId: filters.subSource,
    },
  });

  const assignments: "LOADING" | AssignmentRow[] =
    getVacancyDetails.state == "LOADING"
      ? "LOADING"
      : compact(
          getVacancyDetails.data?.vacancy?.getAssignmentsForVerify ?? []
        ).map(d => ({
          confirmationNumber: d.assignment!.id,
        }));

  return (
    <>
      <Typography variant="h5">{t("Verify substitute assignments")}</Typography>
      <PageTitle title={format(new Date(filters.date), "EEE, MMM d")} />
      <Section>
        <Filters
          orgId={params.organizationId}
          filters={filters}
          setFilters={updateFilters}
        />
        <Divider />
        {assignments == "LOADING" ? (
          <Typography>{t("Loading...")}</Typography>
        ) : (
          <VerifyDailyUI assignments={assignments} />
        )}
      </Section>
    </>
  );
};
