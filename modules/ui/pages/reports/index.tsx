import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Grid, makeStyles, Typography, Divider } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import {
  AnalyticsReportsRoute,
  AnalyticsReportsAbsencesVacanciesRoute,
  AnalyticsReportsDailyReportRoute,
  AnalyticsReportsSubHistoryRoute,
  AnalyticsReportsEmployeeRosterRoute,
  AnalyticsReportsSubstituteRosterRoute,
  AnalyticsReportsEmployeeBalancesRoute,
  AnalyticsReportsAbsencesVacanciesDetailRoute,
} from "ui/routes/analytics-reports";
import { BaseLink, pickUrl } from "ui/components/links/base";
import { CanDo } from "ui/components/auth/types";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import {
  canViewAbsenceAndVacancyReports,
  canViewPeopleReports,
} from "helpers/permissions";

type Props = {};

type ReportGroup = {
  title: string;
  reports: {
    name: string;
    url: () => string;
    permission: PermissionEnum;
  }[];
  permissionCheck: CanDo;
  ref: React.RefObject<HTMLDivElement>;
};

export const ReportsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(AnalyticsReportsRoute);
  const [groupCardHeight, setGroupCardHeight] = React.useState<
    number | undefined
  >(undefined);

  const reportGroups: ReportGroup[] = [
    {
      title: t("Absences & Vacancies"),
      reports: [
        {
          name: t("Absences & Vacancies"),
          url: () => AnalyticsReportsAbsencesVacanciesRoute.generate(params),
          permission: PermissionEnum.ReportsAbsVacSchema,
        },
        {
          name: t("Absences & Vacancies - Detail"),
          url: () =>
            AnalyticsReportsAbsencesVacanciesDetailRoute.generate(params),
          permission: PermissionEnum.ReportsAbsVacSchema,
        },
        {
          name: t("Daily Report"),
          url: () => AnalyticsReportsDailyReportRoute.generate(params),
          permission: PermissionEnum.AbsVacView,
        },
        {
          name: t("Substitute History"),
          url: () => AnalyticsReportsSubHistoryRoute.generate(params),
          permission: PermissionEnum.ReportsAbsVacSchema,
        },
      ],
      permissionCheck: canViewAbsenceAndVacancyReports,
      ref: React.useRef<HTMLDivElement>(null),
    },
    {
      title: t("People"),
      reports: [
        {
          name: t("Employee Roster"),
          url: () => AnalyticsReportsEmployeeRosterRoute.generate(params),
          permission: PermissionEnum.ReportsEmpSchema,
        },
        {
          name: t("Substitute Roster"),
          url: () => AnalyticsReportsSubstituteRosterRoute.generate(params),
          permission: PermissionEnum.ReportsSubSchema,
        },
        {
          name: t("Absence Reason Balances"),
          url: () => AnalyticsReportsEmployeeBalancesRoute.generate(params),
          permission: PermissionEnum.ReportsEmpSchema,
        },
      ],
      permissionCheck: canViewPeopleReports,
      ref: React.useRef<HTMLDivElement>(null),
    },
  ];

  // Doing this in order to keep the Report Group cards a consistent height
  React.useEffect(() => {
    const height = reportGroups
      .map(rg => rg.ref)
      .reduce((prev, current) => {
        return Math.max(prev, current?.current?.clientHeight ?? 0);
      }, 0);
    if (height > 0) {
      setGroupCardHeight(height);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageTitle title={t("Analytics & Reports")} />
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
      >
        {reportGroups.map((rg, i) => {
          return (
            <Can do={rg.permissionCheck} key={i}>
              <Grid item xs={6} ref={rg.ref}>
                <div style={{ height: groupCardHeight }}>
                  <Section className={classes.section}>
                    <Typography variant="h4">{rg.title}</Typography>
                    <div className={classes.reportList}>
                      <Typography variant="h6">{t("Reports")}</Typography>
                      {rg.reports.map((r, i) => {
                        return (
                          <Can do={[r.permission]} key={i}>
                            <div className={classes.reportItem}>
                              <div className={classes.reportLink}>
                                <BaseLink
                                  to={{
                                    ...pickUrl(r.url()),
                                  }}
                                >
                                  {r.name}
                                </BaseLink>
                              </div>
                              <Divider />
                            </div>
                          </Can>
                        );
                      })}
                    </div>
                  </Section>
                </div>
              </Grid>
            </Can>
          );
        })}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  reportList: {
    marginTop: theme.spacing(4),
  },
  reportItem: {
    marginTop: theme.spacing(2),
  },
  reportLink: {
    marginBottom: theme.spacing(),
  },
  section: {
    height: "100%",
  },
}));
