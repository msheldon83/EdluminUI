import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { GetVacanciesForContext } from "./graphql/get-vacancies-for-context.gen";
import { useTranslation } from "react-i18next";
import { parseISO, format } from "date-fns";
import { compact } from "lodash-es";
import { getDateRangeDisplay } from "ui/components/employee/helpers";
import { useLocations } from "reference-data/locations";

type Props = {
  orgId: string;
  vacancyId: string;
  startDate?: string | null;
  endDate?: string | null;
  locationIds: string[];
  vacancyReasons: {
    id: string;
    name: string;
  }[];
};

export const VacancyContext: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const locations = useLocations(props.orgId);
  const vacancyReasons = props.vacancyReasons;

  const vacancyReasonIds = vacancyReasons.map(x => x.id);
  const getVacanciesForContext = useQueryBundle(GetVacanciesForContext, {
    variables: {
      orgId: props.orgId,
      toDate: props.endDate,
      fromDate: props.startDate,
      locationIds: props.locationIds,
      vacancyReasonIds: vacancyReasonIds,
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
      <Grid item xs={12}>
        <div className={classes.title}>{t("Context")}</div>
      </Grid>
      {props.locationIds.map((l, i) => {
        const vacanciesForLocation = vacancies.filter(v => {
          const vlocationIds = [...new Set(v.details.map(vd => vd.locationId))];
          return vlocationIds.includes(l) && v.id !== props.vacancyId;
        });
        return (
          <React.Fragment key={i}>
            {props.vacancyReasons.map((r, z) => {
              const vacanciesForLocationByReason = vacanciesForLocation.filter(
                v => {
                  const reasonIds = [
                    ...new Set(v.details.map(vd => vd.vacancyReasonId)),
                  ];
                  return reasonIds.includes(r.id) && v.id !== props.vacancyId;
                }
              );
              return (
                <Grid item xs={12} container key={z}>
                  <Grid item xs={12}>
                    <div className={classes.subTitle}>{`${t("Other")} ${
                      r.name
                    } ${t("requests")} @ ${
                      locations.find(x => x.id === l)?.name
                    }`}</div>
                  </Grid>
                  <Grid item xs={12}>
                    {vacanciesForLocationByReason.length === 0 ? (
                      <div className={classes.text}>{t("No vacancies")}</div>
                    ) : (
                      vacanciesForLocationByReason.map((v, i) => {
                        <Grid container key={i} spacing={0}>
                          <Grid item xs={4}>
                            {v?.isNormalVacancy
                              ? v.position?.title
                              : `${v?.absence?.employee?.firstName} ${v?.absence?.employee?.lastName}`}
                          </Grid>
                          <Grid item xs={4}>
                            {getDateRangeDisplay(
                              parseISO(v.startDate),
                              parseISO(v.endDate)
                            )}
                          </Grid>
                          <Grid item xs={4}>
                            {v?.createdLocal &&
                              format(parseISO(v?.createdLocal), "MMM d h:mm a")}
                          </Grid>
                        </Grid>;
                      })
                    )}
                  </Grid>
                </Grid>
              );
            })}
          </React.Fragment>
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
  title: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(16),
  },
  text: {
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(14),
  },
}));
