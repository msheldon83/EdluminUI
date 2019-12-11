import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Button, Typography } from "@material-ui/core";
import { SectionHeader } from "ui/components/section-header";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";
import { AbsenceDetailRow } from "./absence-detail-row";

type Props = {
  header?: string;
  absences: EmployeeAbsenceDetail[];
  cancelAbsence: (absenceId: string) => Promise<void>;
  isLoading: boolean;
};

export const ScheduledAbsences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const wrapper = (children: React.ReactFragment) => {
    return (
      <div>
        {props.header && <SectionHeader title={props.header} />}
        {children}
      </div>
    );
  };

  if (props.isLoading) {
    return wrapper(
      <Typography variant="h6">{t("Loading absences")}...</Typography>
    );
  } else if (props.absences.length === 0) {
    return wrapper(
      <Typography variant="h6">{t("No scheduled absences")}</Typography>
    );
  }

  return wrapper(
    <Grid container>
      {props.absences.map((a, i) => {
        const className = [
          classes.detail,
          i % 2 == 1 ? classes.shadedRow : undefined,
        ].join(" ");

        return (
          <Grid item container xs={12} key={i} className={className}>
            <AbsenceDetailRow absence={a} cancelAbsence={props.cancelAbsence} />
          </Grid>
        );
      })}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  detail: {
    padding: theme.spacing(2),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
}));
