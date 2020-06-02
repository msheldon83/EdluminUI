import * as React from "react";
import { useMemo } from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeAbsencesForContext } from "./graphql/get-employee-absences-for-context.gen";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useTranslation } from "react-i18next";
import { parseISO, format } from "date-fns";

type Props = {
  employeeId: string;
  orgId: string;
  absenceId: string;
};

export const AbsenceContext: React.FC<Props> = props => {
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

  const employeeAbsences =
    getEmployeeAbsences.state === "DONE"
      ? getEmployeeAbsences.data.employee?.employeeAbsenceSchedule
      : [];

  const employeeName = `${employeeAbsences[0]?.employee?.firstName} ${employeeAbsences[0]?.employee?.lastName}`;

  return (
    <Grid item container xs={12} spacing={1}>
      <Grid item xs={12}>
        <div className={classes.title}>{t("Context")}</div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.subTitle}>{`${employeeName}'s ${t(
          "absences this school year"
        )}`}</div>
      </Grid>
      <Grid item xs={12}>
        {!employeeAbsences || employeeAbsences.length === 0 ? (
          <div className={classes.text}>{t("No absences")}</div>
        ) : (
          employeeAbsences?.map((a, i) => {
            return (
              <Grid container key={i} spacing={0}>
                <Grid item xs={4}>
                  {a?.details[0]?.reasonUsages[0]?.absenceReason.name}
                </Grid>
                <Grid item xs={4}></Grid>
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
