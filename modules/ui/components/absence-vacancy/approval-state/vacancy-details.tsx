import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DayPart,
  Maybe,
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen";
import { parseISO, differenceInHours, isAfter, isBefore } from "date-fns";
import { makeStyles, Grid } from "@material-ui/core";
import {
  getDateRangeDisplay,
  getDayPartCountLabels,
} from "ui/components/employee/helpers";
import { useAllSchoolYears } from "reference-data/school-years";
import { GetAbsenceReasonBalances } from "ui/pages/employee-pto-balances/graphql/get-absencereasonbalances.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";

type Props = {
  orgId: string;
  vacancy: {
    id: string;
    adminOnlyNotes?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    details?:
      | Maybe<{
          startDate: string;
          endDate: string;
          locationId: string;
          vacancyReason: {
            id: string;
            name: string;
          };
        }>[]
      | null;
  };
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const vacancy = props.vacancy;
  const startDate = parseISO(vacancy.startDate ?? "");
  const endDate = parseISO(vacancy.endDate ?? "");

  const reasons = compact(vacancy.details?.map(x => x?.vacancyReason)) ?? [];
  const uniqueReasonIds = [...new Set(reasons.map(x => x.id))] ?? [];

  return (
    <Grid container item xs={12} spacing={2}>
      <Grid item xs={12}>
        <div className={classes.title}>
          {getDateRangeDisplay(startDate, endDate)}
        </div>
      </Grid>
      <Grid container item xs={12}>
        <Grid
          item
          container
          xs={12}
          className={classes.reasonHeaderContainer}
          alignItems="center"
        >
          <Grid item xs={6}>
            <div className={classes.subTitle}>
              {uniqueReasonIds.length > 1 ? t("Reasons") : t("Reason")}
            </div>
          </Grid>
        </Grid>
        {uniqueReasonIds.map((r, i) => {
          return (
            <Grid
              item
              container
              xs={12}
              alignItems="center"
              key={i}
              className={classes.reasonRowContainer}
            >
              <Grid item xs={6}>
                <div className={classes.text}>
                  {reasons.find(x => x.id === r)?.name}
                </div>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
      <Grid item xs={12}>
        <div className={classes.subTitle}>{t("Administrator comments")}</div>
        <div className={classes.text}>
          {vacancy.adminOnlyNotes ? vacancy.adminOnlyNotes : t("No comments")}
        </div>
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
    fontSize: theme.typography.pxToRem(24),
  },
  text: {
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(14),
  },
  reasonHeaderContainer: {
    background: "#F0F0F0",
    border: "1px solid #E5E5E5",
    padding: theme.spacing(1),
  },
  reasonRowContainer: {
    borderBottom: "1px solid #E5E5E5",
    padding: theme.spacing(1),
  },
}));
