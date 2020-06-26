import { Grid, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";
import { SectionHeader } from "ui/components/section-header";
import { AbsenceDetailRow } from "./absence-detail-row";
import { ApprovalStatus } from "graphql/server-types.gen";

type Props = {
  header?: string;
  absences: EmployeeAbsenceDetail[];
  cancelAbsence: (absenceId: string) => Promise<void>;
  hideAbsence?: (absenceId: string) => Promise<void>;
  isLoading: boolean;
  orgId?: string;
  actingAsEmployee?: boolean;
};

export const ScheduledAbsences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const absences = props.actingAsEmployee
    ? props.absences
    : props.absences.filter(x => x.approvalStatus !== ApprovalStatus.Denied);

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
      {absences.map((a, i) => {
        const className = [
          classes.detail,
          i % 2 == 1 ? classes.shadedRow : undefined,
        ].join(" ");

        return (
          <Grid item container xs={12} key={a.id} className={className}>
            <AbsenceDetailRow
              absence={a}
              cancelAbsence={props.cancelAbsence}
              hideAbsence={props.hideAbsence}
              orgId={props.orgId}
              actingAsEmployee={props.actingAsEmployee}
            />
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
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },
}));
