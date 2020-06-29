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
    <div className={classes.container}>
      <div className={classes.title}>{t("Context")}</div>
      {!props.actingAsEmployee && (
        <div className={classes.otherContextContainer}>
          <OtherContext
            orgId={props.orgId}
            vacancyId={
              props.isNormalVacancy ? props.vacancyId ?? "" : undefined
            }
            absenceId={
              !props.isNormalVacancy ? props.absenceId ?? "" : undefined
            }
            startDate={props.startDate}
            endDate={props.endDate}
            locationIds={props.locationIds}
            vacancyReasonIds={props.vacancyReasonIds}
            absenceReasonIds={props.absenceReasonIds}
          />
        </div>
      )}
      {!props.isNormalVacancy && (
        <EmployeeAbsences
          employeeId={props.employeeId ?? ""}
          orgId={props.orgId}
          absenceId={props.absenceId ?? ""}
          employeeName={props.employeeName ?? ""}
          locationIds={props.locationIds}
          actingAsEmployee={props.actingAsEmployee}
          startDate={props.startDate}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
  },
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
  otherContextContainer: {
    paddingBottom: theme.spacing(1),
  },
}));
