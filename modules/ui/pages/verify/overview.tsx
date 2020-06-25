import * as React from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { compact } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { useLocation, useHistory } from "react-router";
import { useQueryParamIso } from "hooks/query-params";
import { useRouteParams } from "ui/routes/definition";
import { usePresetDateRanges } from "ui/components/form/hooks/use-preset-date-ranges";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { OverviewFilters as Filters } from "./components/filters/overview";
import { DayRow } from "./types";
import { VerifyOverviewUI } from "./overview-ui";
import { GetAssignmentCount } from "./graphql/get-assignment-count.gen";
import { GetJointAssignmentCount } from "./graphql/get-joint-assignment-count.gen";
import { Typography } from "@material-ui/core";
import {
  VerifyOverviewRoute,
  VerifyDailyRoute,
} from "ui/routes/absence-vacancy/verify";
import { FilterQueryParams } from "./components/filters/filter-params";
import { useScrollDimensions } from "hooks/use-scroll-dimensions";
import { PartyPopper } from "./components/party-popper";

export const VerifyOverviewPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);
  const params = useRouteParams(VerifyOverviewRoute);
  const history = useHistory();
  const location = useLocation();
  const { getPresetByDates } = usePresetDateRanges();
  const [ref, { scrollWidth, scrollHeight }] = useScrollDimensions();

  const getJointAssignmentCounts = useQueryBundle(GetJointAssignmentCount, {
    variables: {
      orgId: params.organizationId,
      locationIds: filters.locationIds,
      fromDate: filters.dateRangeStart,
      toDate: filters.dateRangeEnd,
    },
  });

  const dates: "LOADING" | DayRow[] =
    getJointAssignmentCounts.state == "LOADING"
      ? "LOADING"
      : compact(
          getJointAssignmentCounts.data.vacancy
            ?.getJointCountOfAssignmentsForVerify ?? []
        ).reduce((acc: DayRow[], t) => {
          if (t.date) {
            acc.push({
              ...t,
              date: parseISO(t.date),
            });
          }
          return acc;
        }, []);

  const allVerified = React.useMemo(
    () =>
      dates == "LOADING"
        ? false
        : dates.every(({ unverifiedCount }) => unverifiedCount == 0),
    [dates]
  );

  const getDateTitle = (startDate: Date, endDate: Date) =>
    getPresetByDates(startDate, endDate)?.label ??
    `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;

  return (
    <div ref={ref}>
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
        {allVerified && (
          <PartyPopper width={scrollWidth} height={scrollHeight}>
            {t("Hooray! Your job is done here!")}
          </PartyPopper>
        )}
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
    </div>
  );
};
