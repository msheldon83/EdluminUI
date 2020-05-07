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
} from "ui/routes/analytics-reports";
import { BaseLink, pickUrl } from "ui/components/links/base";

type Props = {};

type ReportGroup = {
  title: string;
  reports: {
    name: string;
    url: () => string;
  }[];
};

export const ReportsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(AnalyticsReportsRoute);

  const reportGroups: ReportGroup[] = [
    {
      title: t("Absences & Vacancies"),
      reports: [
        {
          name: t("Absences & Vacancies"),
          url: () => AnalyticsReportsAbsencesVacanciesRoute.generate(params),
        },
        {
          name: t("Daily Report"),
          url: () => AnalyticsReportsDailyReportRoute.generate(params),
        },
        {
          name: t("Substitute History"),
          url: () => AnalyticsReportsSubHistoryRoute.generate(params),
        },
      ],
    },
  ];

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
            <Grid item xs={6} key={i}>
              <Section>
                <Typography variant="h4">{rg.title}</Typography>
                <div className={classes.reportList}>
                  <Typography variant="h6">{t("Reports")}</Typography>
                  {rg.reports.map((r, i) => {
                    return (
                      <div className={classes.reportItem} key={i}>
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
                    );
                  })}
                </div>
              </Section>
            </Grid>
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
}));
