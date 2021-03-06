import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DayPart,
  Maybe,
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen";
import { parseISO, isAfter, isBefore } from "date-fns";
import { makeStyles } from "@material-ui/core";
import { useAllSchoolYears } from "reference-data/school-years";
import { GetAbsenceReasonBalances } from "ui/pages/employee-pto-balances/graphql/get-absencereasonbalances.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact, groupBy, flatMap, round } from "lodash-es";
import { SummaryDetails } from "./summary-details";

type Props = {
  orgId: string;
  absence: {
    id: string;
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
          reasonUsages?:
            | Maybe<{
                hourlyAmount: number;
                dailyAmount: number;
                absenceReasonId: string;
                absenceReason?: {
                  name: string;
                } | null;
              }>[]
            | null;
        }>[]
      | null;
  };
  actingAsEmployee?: boolean;
  showSimpleDetail: boolean;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const absence = props.absence;
  const startDate = parseISO(absence.startDate ?? "");

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

  const absenceReasons = useMemo(
    () =>
      absence
        ? Object.entries(
            groupBy(
              flatMap(
                compact(absence.details).map(x => compact(x.reasonUsages))
              ),
              r => r?.absenceReasonId
            )
          ).map(([absenceReasonId, usages]) => {
            const balance = employeeBalances.find(
              x => x.absenceReasonId === absenceReasonId
            );
            const remainingBalance = round(balance?.unusedBalance, 2);
            const totalHourlyUsage = round(
              usages.reduce((m, v) => m + +v.hourlyAmount, 0),
              2
            );
            const totalDailyUsage = round(
              usages.reduce((m, v) => m + +v.dailyAmount, 0),
              2
            );

            return {
              remainingBalanceText: remainingBalance
                ? `${remainingBalance} ${getUnitText(
                    balance?.absenceReasonTrackingTypeId ??
                      AbsenceReasonTrackingTypeId.Invalid,
                    remainingBalance
                  )}`
                : t("Not tracked"),
              absenceReasonId: absenceReasonId,
              absenceReasonName: usages[0].absenceReason?.name,
              absenceReasonTrackingType: balance?.absenceReasonTrackingTypeId,
              hourlyUsageText: remainingBalance
                ? `${totalHourlyUsage} ${getUnitText(
                    AbsenceReasonTrackingTypeId.Hourly,
                    totalHourlyUsage
                  )}`
                : undefined,
              dailyUsageText: remainingBalance
                ? `${totalDailyUsage} ${getUnitText(
                    AbsenceReasonTrackingTypeId.Daily,
                    totalDailyUsage
                  )}`
                : undefined,
            };
          })
        : [],
    [absence, employeeBalances, t]
  );

  return (
    <div className={classes.detailsContainer}>
      {props.showSimpleDetail && (
        <SummaryDetails
          orgId={props.orgId}
          absenceDetails={absence.details}
          startDate={absence.startDate}
          endDate={absence.endDate}
          isNormalVacancy={false}
          simpleSummary={true}
          absVacId={absence.id}
        />
      )}
      <div className={classes.reasonHeaderContainer}>
        <div className={[classes.subTitle, classes.reason].join(" ")}>
          {t("Reason")}
        </div>
        <div className={[classes.subTitle, classes.used].join(" ")}>
          {t("Used")}
        </div>
        <div className={[classes.subTitle, classes.remaining].join(" ")}>
          {t("Remaining")}
        </div>
      </div>
      {absenceReasons.map((g, i) => {
        return (
          <div key={i} className={classes.reasonRowContainer}>
            <div className={[classes.text, classes.reason].join(" ")}>
              {g.absenceReasonName}
            </div>
            <div className={[classes.text, classes.used].join(" ")}>
              {g.absenceReasonTrackingType === AbsenceReasonTrackingTypeId.Daily
                ? g.dailyUsageText
                : g.absenceReasonTrackingType ===
                  AbsenceReasonTrackingTypeId.Hourly
                ? g.hourlyUsageText
                : ""}
            </div>
            <div className={[classes.text, classes.remaining].join(" ")}>
              {g.remainingBalanceText}
            </div>
          </div>
        );
      })}
      <div className={classes.notesContainer}>
        <div className={classes.subTitle}>{t("Notes to administrator")}</div>
        <div className={classes.text}>
          {absence.notesToApprover ? absence.notesToApprover : t("No notes")}
        </div>
      </div>
      {!props.actingAsEmployee && (
        <div className={classes.notesContainer}>
          <div className={classes.subTitle}>{t("Administrator comments")}</div>
          <div className={classes.text}>
            {absence.adminOnlyNotes ? absence.adminOnlyNotes : t("No comments")}
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  detailsContainer: {
    width: "100%",
  },
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
    display: "flex",
    width: "95%",
  },
  reasonRowContainer: {
    borderBottom: "1px solid #E5E5E5",
    padding: theme.spacing(1),
    display: "flex",
    width: "95%",
  },
  reason: {
    width: "50%",
  },
  used: {
    width: "25%",
  },
  remaining: {
    width: "25%",
  },
  notesContainer: {
    paddingTop: theme.spacing(2),
  },
}));
