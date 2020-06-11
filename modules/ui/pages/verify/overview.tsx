import * as React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { compact } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { useLocation, useHistory } from "react-router";
import { useQueryParamIso } from "hooks/query-params";
import { useRouteParams } from "ui/routes/definition";
import { useState } from "react";
import { usePresetDateRanges } from "ui/components/form/hooks/use-preset-date-ranges";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { OverviewFilters as Filters } from "./components/filters/overview";
import { VerifyUI } from "./ui";
import { DayRow } from "./types";
import { VerifyOverviewUI } from "./overview-ui";
import { GetAssignmentCount } from "./graphql/get-assignment-count.gen";
import { Typography } from "@material-ui/core";
import {
  VerifyOverviewRoute,
  VerifyDailyRoute,
} from "ui/routes/absence-vacancy/verify";
import {
  FilterQueryParams,
  VerifyQueryFilters,
  FilterParams,
} from "./components/filters/filter-params";
import { addDays } from "date-fns";

export const VerifyOverviewPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);
  const [showVerified, setShowVerified] = useState(false);
  const params = useRouteParams(VerifyOverviewRoute);
  const history = useHistory();
  const location = useLocation();
  const { presetDateRanges, getPresetByDates } = usePresetDateRanges();
  // TODO: update getCountOfAssignmentsForVerify so we don't need to call it twice.
  const getUnverifiedAssignmentCounts = useQueryBundle(GetAssignmentCount, {
    variables: {
      orgId: params.organizationId,
      locationIds: filters.locationIds,
      fromDate: filters.dateRangeStart,
      toDate: filters.dateRangeEnd,
      includeVerified: false,
    },
  });
  const getTotalAssignmentCounts = useQueryBundle(GetAssignmentCount, {
    variables: {
      orgId: params.organizationId,
      locationIds: filters.locationIds,
      fromDate: filters.dateRangeStart,
      toDate: filters.dateRangeEnd,
      //includeVerified: true,
    },
  });

  const zipCounts = (
    total: { date: string; count: number }[],
    unverified: { date: string; count: number }[]
  ) =>
    total.map(t => ({
      date: new Date(t.date),
      verifiedAssignments:
        t.count - (unverified.find(u => t.date == u.date)?.count ?? 0),
      totalAssignments: t.count,
    }));

  const dates: "LOADING" | DayRow[] =
    getTotalAssignmentCounts.state == "LOADING"
      ? "LOADING"
      : getUnverifiedAssignmentCounts.state == "LOADING"
      ? "LOADING"
      : zipCounts(
          compact(
            getTotalAssignmentCounts?.data?.vacancy
              ?.getCountOfAssignmentsForVerify ?? []
          ).filter((t): t is { date: string; count: number } => !!t.date),
          compact(
            getUnverifiedAssignmentCounts?.data?.vacancy
              ?.getCountOfAssignmentsForVerify ?? []
          ).filter((u): u is { date: string; count: number } => !!u.date)
        );

  const getDateTitle = (startDate: Date, endDate: Date) =>
    getPresetByDates(startDate, endDate)?.label ??
    `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;

  return (
    <>
      <Typography variant="h5">{t("Verify substitute assignments")}</Typography>
      <PageTitle
        title={getDateTitle(filters.dateRangeStart, filters.dateRangeEnd)}
      />
      <Section>
        <Filters
          orgId={params.organizationId}
          filters={filters}
          setFilters={updateFilters}
        />
        {dates == "LOADING" ? (
          <Typography>{t("Loading...")}</Typography>
        ) : (
          <VerifyOverviewUI
            dates={dates}
            goToDate={date => {
              const searchParams = new URLSearchParams(location.search);
              searchParams.set("date", format(date, "P"));
              history.push({
                pathname: VerifyDailyRoute.generate(params),
                search: searchParams.toString(),
              });
            }}
          />
        )}
      </Section>
      {false && (
        <VerifyUI
          showVerified={showVerified}
          locationsFilter={filters.locationIds}
          subSourceFilter={filters.subSource}
        />
      )}
    </>
  );
};
