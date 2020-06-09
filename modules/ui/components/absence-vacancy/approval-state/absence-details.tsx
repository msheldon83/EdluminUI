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
import { compact, round } from "lodash-es";

type Props = {
  orgId: string;
  absence: {
    employeeId: string;
    notesToApprover?: string | null;
    adminOnlyNotes?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    details?:
      | Maybe<{
          dayPartId?: DayPart | null;
          dayPortion: number;
          endTimeLocal?: string | null;
          startTimeLocal?: string | null;
        }>[]
      | null;
  };
  absenceReasons: {
    absenceReasonId: string;
    absenceReasonName?: string | null;
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
    totalAmount: number;
  }[];
  actingAsEmployee?: boolean;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const absence = props.absence;
  const startDate = parseISO(absence.startDate ?? "");
  const endDate = parseISO(absence.endDate ?? "");

  const allSchoolYears = useAllSchoolYears(props.orgId);
  const schoolYearId = allSchoolYears.find(
    x =>
      isAfter(startDate, parseISO(x.startDate)) &&
      isBefore(startDate, parseISO(x.endDate))
  )?.id;

  const getAbsenceReasonBalances = useQueryBundle(GetAbsenceReasonBalances, {
    variables: {
      employeeId: absence.employeeId,
      schoolYearId: schoolYearId,
    },
    skip: !schoolYearId,
  });

  const employeeBalances = useMemo(() => {
    if (
      getAbsenceReasonBalances.state === "DONE" &&
      getAbsenceReasonBalances.data?.absenceReasonBalance
    ) {
      return (
        compact(
          getAbsenceReasonBalances.data.absenceReasonBalance.byEmployeeId
        ) ?? []
      );
    }
    return [];
  }, [getAbsenceReasonBalances]);

  const getUnitText = (
    trackingType: AbsenceReasonTrackingTypeId,
    amount: number
  ) => {
    const unitText = {
      INVALID: null,
      DAILY: ["day", "days"],
      HOURLY: ["hour", "hours"],
    }[trackingType];

    if (!unitText) return null;

    return unitText[Number(amount !== 1)];
  };

  const allDayParts =
    absence.details && absence.details.length > 0
      ? absence.details.map(d => ({
          dayPart: d!.dayPartId!,
          dayPortion: d!.dayPortion,
          hourDuration: differenceInHours(
            parseISO(d!.endTimeLocal!),
            parseISO(d!.startTimeLocal!)
          ),
        }))
      : [];

  const getRemainingBalanceText = (absenceReasonId: string) => {
    const balance = employeeBalances.find(
      x => x.absenceReasonId === absenceReasonId
    );
    return balance
      ? `${round(balance?.unusedBalance, 2)} ${getUnitText(
          balance?.absenceReasonTrackingTypeId ??
            AbsenceReasonTrackingTypeId.Invalid,
          balance?.unusedBalance
        )}`
      : t("Not tracked");
  };

  return (
    <Grid container item xs={12} spacing={2}>
      <Grid item xs={12}>
        <div className={classes.title}>
          {`${getDateRangeDisplay(startDate, endDate)} (${getDayPartCountLabels(
            allDayParts,
            t
          ).join(", ")})`}
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
            <div className={classes.subTitle}>{t("Reason")}</div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.subTitle}>{t("Used")}</div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.subTitle}>{t("Remaining")}</div>
          </Grid>
        </Grid>
        {props.absenceReasons.map((g, i) => {
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
                <div className={classes.text}>{g.absenceReasonName}</div>
              </Grid>
              <Grid item xs={3}>
                <div className={classes.text}>{`${g.totalAmount} ${getUnitText(
                  g.absenceReasonTrackingTypeId ??
                    AbsenceReasonTrackingTypeId.Invalid,
                  g.totalAmount
                )}`}</div>
              </Grid>
              <Grid item xs={3}>
                <div className={classes.text}>
                  {getRemainingBalanceText(g.absenceReasonId)}
                </div>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
      <Grid item xs={12}>
        <div className={classes.subTitle}>{t("Notes to administrator")}</div>
        <div className={classes.text}>
          {absence.notesToApprover ? absence.notesToApprover : t("No notes")}
        </div>
      </Grid>
      {!props.actingAsEmployee && (
        <Grid item xs={12}>
          <div className={classes.subTitle}>{t("Administrator comments")}</div>
          <div className={classes.text}>
            {absence.adminOnlyNotes ? absence.adminOnlyNotes : t("No comments")}
          </div>
        </Grid>
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
