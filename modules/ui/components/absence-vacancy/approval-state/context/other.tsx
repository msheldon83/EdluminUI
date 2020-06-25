import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { GetVacanciesForContext } from "../graphql/get-vacancies-for-context.gen";
import { useTranslation } from "react-i18next";
import { parseISO } from "date-fns";
import { compact } from "lodash-es";
import { getDateRangeDisplay } from "ui/components/employee/helpers";
import { useLocations } from "reference-data/locations";

type Props = {
  orgId: string;
  vacancyId?: string;
  absenceId?: string;
  startDate?: string | null;
  endDate?: string | null;
  locationIds: string[];
  vacancyReasonIds?: string[];
  absenceReasonIds?: string[];
};

export const OtherContext: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const locations = useLocations(props.orgId);

  // Making sure this is a unique set of Ids
  const locationIds = [...new Set(props.locationIds)];
  const getVacanciesForContext = useQueryBundle(GetVacanciesForContext, {
    variables: {
      orgId: props.orgId,
      toDate: props.endDate,
      fromDate: props.startDate,
      locationIds: locationIds,
      vacancyReasonIds: props.vacancyReasonIds,
      absenceReasonIds: props.absenceReasonIds,
    },
  });

  const vacancies =
    getVacanciesForContext.state === "DONE"
      ? compact(
          getVacanciesForContext.data.vacancy?.vacanciesForApprovalContext
        )
      : [];

  if (!vacancies) {
    return <></>;
  }

  return (
    <Grid item container xs={12} spacing={1}>
      {locationIds.map((l, i) => {
        const vacanciesForLocation = vacancies.filter(v => {
          const vlocationIds = [...new Set(v.details.map(vd => vd.locationId))];
          return (
            vlocationIds.includes(l) &&
            ((props.vacancyId && v.id !== props.vacancyId) ||
              (props.absenceId && v.absenceId !== props.absenceId))
          );
        });
        return (
          <Grid item xs={12} container key={i}>
            <Grid item xs={12}>
              <div className={classes.subTitle}>{`${t("Other requests")} @ ${
                locations.find(x => x.id === l)?.name
              }`}</div>
            </Grid>
            <Grid item xs={12}>
              {vacanciesForLocation.length === 0 ? (
                <div className={classes.text}>{t("No requests")}</div>
              ) : (
                <>
                  <Grid container spacing={0}>
                    <Grid item xs={5}>
                      <div className={classes.headerText}>{t("Name")}</div>
                    </Grid>
                    <Grid item xs={3}>
                      <div className={classes.headerText}>{t("Dates")}</div>
                    </Grid>
                    <Grid item xs={4}>
                      <div className={classes.headerText}>{t("Reason")}</div>
                    </Grid>
                  </Grid>
                  {vacanciesForLocation.map((v, i) => {
                    return (
                      <Grid container key={i} spacing={0}>
                        <Grid item xs={5}>
                          {v?.isNormalVacancy
                            ? v.position?.title
                            : `${v?.absence?.employee?.firstName} ${v?.absence?.employee?.lastName}`}
                        </Grid>
                        <Grid item xs={3}>
                          {getDateRangeDisplay(
                            parseISO(v.startDate),
                            parseISO(v.endDate)
                          )}
                        </Grid>
                        <Grid item xs={4}>
                          {v?.isNormalVacancy
                            ? v?.details[0]?.vacancyReason?.name
                            : v.absence!.details![0]!.reasonUsages![0]!
                                .absenceReason?.name}
                        </Grid>
                      </Grid>
                    );
                  })}
                </>
              )}
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  subTitle: {
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(14),
  },
  text: {
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(14),
  },

  headerText: {
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(14),
  },
}));
