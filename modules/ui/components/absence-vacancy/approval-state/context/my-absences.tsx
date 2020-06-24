import * as React from "react";
import { useMemo } from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeAbsencesForContext } from "../graphql/get-employee-absences-for-context.gen";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useTranslation } from "react-i18next";
import { parseISO, format } from "date-fns";
import { compact } from "lodash-es";
import { getDateRangeDisplay } from "ui/components/employee/helpers";

type Props = {
  employeeId: string;
  orgId: string;
  absenceId: string;
  employeeName: string;
  locationIds: string[];
  actingAsEmployee?: boolean;
};

export const EmployeeAbsences: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

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

  if (!employeeAbsences) {
    return <></>;
  }

  return (
    <Grid item container xs={12}>
      <Grid item xs={12}>
        <div className={classes.subTitle}>{`${
          props.actingAsEmployee ? t("Your") : `${props.employeeName}'s`
        } ${t("absences this school year")}`}</div>
      </Grid>
      <Grid item xs={12}>
        {employeeAbsences.length === 0 ? (
          <div className={classes.text}>{t("No absences")}</div>
        ) : (
          <>
            <Grid container spacing={0}>
              <Grid item xs={5}>
                <div className={classes.headerText}>{t("Reason")}</div>
              </Grid>
              <Grid item xs={3}>
                <div className={classes.headerText}>{t("Dates")}</div>
              </Grid>
              <Grid item xs={4}>
                <div className={classes.headerText}>{t("Created date")}</div>
              </Grid>
            </Grid>
            {employeeAbsences.map((a, i) => {
              return (
                <Grid container key={i} spacing={0}>
                  <Grid item xs={5}>
                    {a?.details && a.details[0]?.reasonUsages
                      ? a?.details[0]?.reasonUsages[0]?.absenceReason?.name
                      : ""}
                  </Grid>
                  <Grid item xs={3}>
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
            })}
          </>
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
  text: {
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(14),
  },
  headerText: {
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(14),
  },
}));
