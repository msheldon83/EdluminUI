import * as React from "react";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { addDays, format, isToday } from "date-fns";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";
import { useQueryParamIso } from "hooks/query-params";
import { useRouteParams } from "ui/routes/definition";
import { BaseLink } from "ui/components/links/base";
import {
  VerifyOverviewRoute,
  VerifyDailyRoute,
} from "ui/routes/absence-vacancy/verify";
import { FilterQueryParams } from "./filters/filter-params";
import { GetAssignmentCount } from "../graphql/get-assignment-count.gen";

type Props = {
  orgId: string;
};

export const VerifiedDailyFooter: React.FC<Props> = ({ orgId }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [filters] = useQueryParamIso(FilterQueryParams);
  const params = useRouteParams(VerifyOverviewRoute);
  const classes = useStyles();
  const getUnverifiedCounts = useQueryBundle(GetAssignmentCount, {
    variables: {
      orgId,
      locationIds: filters.locationIds,
      fromDate: filters.dateRangeStart,
      toDate: filters.dateRangeEnd,
    },
  });

  if (getUnverifiedCounts.state == "LOADING") return <> </>;

  const unverifiedCount =
    getUnverifiedCounts.data.vacancy?.getCountOfAssignmentsForVerify?.reduce(
      (acc, d) => acc + (d?.count ?? 0),
      0
    ) ?? 0;

  const routeWithSearch = (pathname: string, newDate?: Date) => {
    const searchParams = new URLSearchParams(location.search);
    if (newDate) searchParams.set("date", format(newDate, "P"));
    return { pathname, search: searchParams.toString() };
  };
  const tommorowClass = isToday(filters.date)
    ? classes.hiddenTomorrow
    : undefined;

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      className={classes.container}
    >
      <Grid item container justify="center">
        <Grid item className={classes.cell}>
          <BaseLink
            to={routeWithSearch(
              VerifyDailyRoute.generate(params),
              addDays(filters.date, -1)
            )}
          >
            {`< ${format(addDays(filters.date, -1), "MMMM d")}`}
          </BaseLink>
        </Grid>
        <Grid item className={classes.cell}>
          <BaseLink to={routeWithSearch(VerifyOverviewRoute.generate(params))}>
            {t("Back to summary view")}
          </BaseLink>
        </Grid>
        <Grid item className={classes.cell}>
          <BaseLink
            linkClass={tommorowClass}
            textClass={tommorowClass}
            to={routeWithSearch(
              VerifyDailyRoute.generate(params),
              addDays(filters.date, 1)
            )}
          >
            {`${format(addDays(filters.date, 1), "MMMM d")} >`}
          </BaseLink>
        </Grid>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
  },
  cell: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  hiddenTomorrow: {
    visibility: "hidden",
  },
}));
