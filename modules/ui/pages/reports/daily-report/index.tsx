import { Button, Grid } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/styles";
import clsx from "clsx";
import { useIsMobile } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DateStepperHeader } from "ui/components/date-stepper-header";
import { MobileActionBar } from "ui/components/mobile-action-bar";
import { PrintPageButton } from "ui/components/print-page-button";
import { DailyReport } from "ui/components/reports/daily-report/daily-report";
import { FilterQueryParams } from "ui/components/reports/daily-report/filters/filter-params";
import { DailyReportRoute } from "ui/routes/absence-vacancy/daily-report";
import { AdminSelectEmployeeForCreateAbsenceRoute } from "ui/routes/absence";
import { useRouteParams } from "ui/routes/definition";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import { useLocation } from "react-router";
import { useEffect } from "react";
import { AppConfig } from "hooks/app-config";

type Props = {};

export const DailyReportPage: React.FC<Props> = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(DailyReportRoute);
  const [filters] = useQueryParamIso(FilterQueryParams);
  const [date, setDate] = React.useState(new Date(filters.date));
  const isMobile = useIsMobile();
  const location = useLocation();

  const dateFromFilter = React.useMemo(() => {
    return new Date(filters.date);
  }, [filters.date]);

  useEffect(() => {
    if (location.search === "") {
      setDate(new Date());
    }
  }, [location]);

  return (
    <AppConfig contentWidth="100%">
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={clsx(classes.header, isMobile && classes.mobileHeader)}
      >
        <Grid item>
          <DateStepperHeader
            date={dateFromFilter}
            setDate={setDate}
          ></DateStepperHeader>
        </Grid>
        {!isMobile && (
          <Grid item className={classes.action}>
            <Can do={[PermissionEnum.AbsVacSave]}>
              <Button
                variant="contained"
                component={Link}
                to={AdminSelectEmployeeForCreateAbsenceRoute.generate(params)}
              >
                {t("Create Absence")}
              </Button>
            </Can>
          </Grid>
        )}
      </Grid>

      <DailyReport
        orgId={params.organizationId}
        date={date}
        setDate={setDate}
        header={t(isMobile ? "Absences" : "Filter absences")}
        showFilters={true}
        cards={["unfilled", "filled", "noSubRequired", "total"]}
      />
      <MobileActionBar>
        <div className={classes.mobileBar}>
          <PrintPageButton />
          <Can do={[PermissionEnum.AbsVacSave]}>
            <Button
              variant="contained"
              component={Link}
              to={AdminSelectEmployeeForCreateAbsenceRoute.generate(params)}
            >
              {t("Create Absence")}
            </Button>
          </Can>
        </div>
      </MobileActionBar>
    </AppConfig>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(3),
    "@media print": {
      marginBottom: theme.spacing(),
    },
  },
  mobileHeader: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  action: {
    "@media print": {
      display: "none",
    },
  },
  mobileBar: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));
