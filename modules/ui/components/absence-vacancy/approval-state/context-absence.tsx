import * as React from "react";
import { useMemo } from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeAbsencesForContext } from "./graphql/get-employee-absences-for-context.gen";
import { GetVacanciesForContext } from "./graphql/get-vacancies-for-context.gen";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useTranslation } from "react-i18next";
import { parseISO, format } from "date-fns";
import { compact } from "lodash-es";
import { getDateRangeDisplay } from "ui/components/employee/helpers";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
import { useLocations } from "reference-data/locations";

type Props = {
  employeeId: string;
  orgId: string;
  absenceId: string;
  employeeName: string;
  startDate?: string | null;
  endDate?: string | null;
  locationIds: string[];
  absenceReasons: {
    absenceReasonId: string;
    absenceReasonName?: string | null;
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
    totalAmount: number;
  }[];
};

export const AbsenceContext: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const locations = useLocations(props.orgId);

  const currentSchoolYear = useCurrentSchoolYear(props.orgId);

  const startDateOfSchoolYear = useMemo(
    () =>
      currentSchoolYear ? parseISO(currentSchoolYear?.startDate) : new Date(),
    [currentSchoolYear]
  );
  const endDate = useMemo(
    () =>
      currentSchoolYear ? parseISO(currentSchoolYear?.endDate) : new Date(),
    [currentSchoolYear]
  );

  const getEmployeeAbsences = useQueryBundle(GetEmployeeAbsencesForContext, {
    variables: {
      id: props.employeeId,
      fromDate: startDateOfSchoolYear,
      toDate: endDate,
    },
    skip: !currentSchoolYear?.startDate || !currentSchoolYear?.endDate,
  });

  const employeeAbsences = useMemo(
    () =>
      getEmployeeAbsences.state === "DONE"
        ? compact(
            getEmployeeAbsences.data.employee?.employeeAbsenceSchedule
          ).filter(x => x.id !== props.absenceId && !x.isDeleted)
        : [],
    [getEmployeeAbsences, props.absenceId]
  );

  const absenceReasonIds = props.absenceReasons.map(x => x.absenceReasonId);
  const getVacanciesForContext = useQueryBundle(GetVacanciesForContext, {
    variables: {
      orgId: props.orgId,
      toDate: props.endDate,
      fromDate: props.startDate,
      locationIds: props.locationIds,
      absenceReasonIds: absenceReasonIds,
    },
  });

  const vacancies =
    getVacanciesForContext.state === "DONE"
      ? compact(
          getVacanciesForContext.data.vacancy?.vacanciesForApprovalContext
        )
      : [];
  console.log(vacancies);

  if (!employeeAbsences || !vacancies) {
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
          return vlocationIds.includes(l);
        });
        return (
          <Grid item xs={12} container key={i}>
            <Grid item xs={12}>
              <div className={classes.subTitle}>{`${t("Other")} ${
                props.absenceReasons[0].absenceReasonName
              } ${t("requests")} "@" ${
                locations.find(x => x.id === l)?.name
              }`}</div>
            </Grid>
            <Grid item xs={12}>
              {vacanciesForLocation.length === 0 ? (
                <div className={classes.text}>{t("No absences")}</div>
              ) : (
                vacanciesForLocation.map((v, i) => {
                  return (
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
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Grid>
        );
      })}

      <Grid item xs={12}>
        <div className={classes.subTitle}>{`${props.employeeName}'s ${t(
          "absences this school year"
        )}`}</div>
      </Grid>
      <Grid item xs={12}>
        {employeeAbsences.length === 0 ? (
          <div className={classes.text}>{t("No absences")}</div>
        ) : (
          employeeAbsences.map((a, i) => {
            return (
              <Grid container key={i} spacing={0}>
                <Grid item xs={4}>
                  {a?.details && a.details[0]?.reasonUsages
                    ? a?.details[0]?.reasonUsages[0]?.absenceReason?.name
                    : ""}
                </Grid>
                <Grid item xs={4}>
                  {getDateRangeDisplay(
                    parseISO(a.startDate),
                    parseISO(a.endDate)
                  )}
                </Grid>
                <Grid item xs={4}>
                  {a?.createdLocal &&
                    format(parseISO(a?.createdLocal), "MMM d h:mm a")}
                </Grid>
              </Grid>
            );
          })
        )}
      </Grid>
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
