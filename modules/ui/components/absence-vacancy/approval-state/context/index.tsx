import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { OtherContext } from "./other";
import { EmployeeAbsences } from "./my-absences";

type Props = {
  employeeId?: string;
  orgId: string;
  absenceId?: string;
  vacancyId?: string;
  isNormalVacancy: boolean;
  employeeName?: string;
  startDate?: string | null;
  endDate?: string | null;
  locationIds: string[];
  vacancyReasonIds?: string[];
  absenceReasonIds?: string[];
  actingAsEmployee?: boolean;
};

export const Context: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid item container xs={12} spacing={1}>
      <Grid item xs={12}>
        <div className={classes.title}>{t("Context")}</div>
      </Grid>
      {!props.actingAsEmployee && (
        <OtherContext
          orgId={props.orgId}
          vacancyId={props.isNormalVacancy ? props.vacancyId ?? "" : undefined}
          absenceId={!props.isNormalVacancy ? props.absenceId ?? "" : undefined}
          startDate={props.startDate}
          endDate={props.endDate}
          locationIds={props.locationIds}
          vacancyReasonIds={props.vacancyReasonIds}
          absenceReasonIds={props.absenceReasonIds}
        />
      )}
      {!props.isNormalVacancy && (
        <EmployeeAbsences
          employeeId={props.employeeId ?? ""}
          orgId={props.orgId}
          absenceId={props.absenceId ?? ""}
          employeeName={props.employeeName ?? ""}
          locationIds={props.locationIds}
          actingAsEmployee={props.actingAsEmployee}
        />
      )}
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
