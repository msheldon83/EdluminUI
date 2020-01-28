import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Button, Typography } from "@material-ui/core";
import { SectionHeader } from "ui/components/section-header";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";
import { AbsenceDetailRow } from "./absence-detail-row";
import { CancelDialog } from "ui/components/substitutes/assignment-row/cancel-dialog";
import { useCallback } from "react";

type Props = {
  header?: string;
  absences: EmployeeAbsenceDetail[];
  cancelAbsence?: (absenceId: string) => Promise<void>;
  handleAfterAbsence?: Function;
  isLoading: boolean;
  orgId?: string;
  isAdmin?: boolean;
};

export const ScheduledAbsences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  const onClickCancel = useCallback(() => setDialogIsOpen(true), [
    setDialogIsOpen,
  ]);

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
            <CancelDialog
              open={dialogIsOpen}
              onClose={() => setDialogIsOpen(false)}
              onCancel={() => {
                props.cancelAbsence && props.cancelAbsence(a.id);
                setDialogIsOpen(false);
              }}
            />

            <AbsenceDetailRow
              absence={a}
              cancelAbsence={onClickCancel}
              handleAfterCancel={props.handleAfterAbsence}
              orgId={props.orgId}
              isAdmin={props.isAdmin}
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
