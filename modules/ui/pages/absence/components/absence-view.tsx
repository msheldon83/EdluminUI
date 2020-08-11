import * as React from "react";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { parseISO, format } from "date-fns";
import {
  Absence,
  PayCode,
  PermissionEnum,
  VacancyDetailAccountingCode,
  DayPart,
  AbsenceDetail,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { getDateRangeDisplayTextWithDayOfWeekForContiguousDates } from "ui/components/date-helpers";
import { EmployeeLink } from "ui/components/links/people";
import { accountingCodeAllocationsAreTheSame } from "helpers/accounting-code-allocations";
import { CreateAbsenceCalendar } from "ui/components/absence/create-absence-calendar";
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary";
import { convertVacancyToVacancySummaryDetails } from "ui/components/absence-vacancy/vacancy-summary/helpers";
import { Can } from "ui/components/auth/can";
import { dayPartToLabel } from "ui/components/absence/helpers";
import { AssignmentOnDate } from "../types";

type Props = {
  absence: Absence;
  actingAsEmployee?: boolean;
  onCancelAssignment?: (
    vacancyDetailIds: string[],
    vacancyDetailDates?: Date[]
  ) => Promise<boolean>;
  assignmentsByDate?: AssignmentOnDate[];
};

export const AbsenceView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    absence,
    actingAsEmployee,
    onCancelAssignment,
    assignmentsByDate = [],
  } = props;

  const absenceDates = useMemo(
    () =>
      absence.details ? absence.details.map(d => parseISO(d?.startDate)) : [],
    [absence.details]
  );

  const vacancySummaryDetails = useMemo(() => {
    if (!absence?.vacancies || !absence.vacancies[0]) {
      return [];
    }

    const details = convertVacancyToVacancySummaryDetails(
      absence.vacancies[0],
      assignmentsByDate
    );
    return details;
  }, [absence?.vacancies, assignmentsByDate]);

  const subDetailsAbsenceInfo = React.useMemo(() => {
    const payCode = getFirstPayCode(absence);
    const payCodesAreTheSame = payCode
      ? allPayCodeSelectionsAreTheSame(payCode, absence)
      : true;
    const accountingCodeAllocations = getFirstSetOfAccountingCodeAllocations(
      absence
    );
    const accountingCodeAllocationsAreTheSame = accountingCodeAllocations
      ? allAccountingCodeSelectionsAreTheSame(
          accountingCodeAllocations,
          absence
        )
      : true;
    const multipleAccountingCodeAllocations =
      (accountingCodeAllocations ?? []).length > 1;

    return (
      <>
        <div className={classes.requiresSubSection}>
          <Typography variant="h6">{t("Requires a substitute")}</Typography>
        </div>
        <>
          {!actingAsEmployee && (accountingCodeAllocations || payCode) && (
            <Grid item container>
              {accountingCodeAllocations && (
                <Can do={[PermissionEnum.AbsVacViewAccountCode]}>
                  <Grid item xs={payCode ? 6 : 12}>
                    <Typography variant={"h6"}>
                      {t("Accounting code")}
                    </Typography>
                    {accountingCodeAllocationsAreTheSame
                      ? accountingCodeAllocations.map((a, i) => {
                          return (
                            <div key={i}>
                              {a.accountingCode?.name}{" "}
                              {multipleAccountingCodeAllocations
                                ? `(${(a.allocation * 100).toFixed(2)}%)`
                                : ""}
                            </div>
                          );
                        })
                      : t(
                          "Details have different Accounting code selections. Click on Edit below to manage."
                        )}
                  </Grid>
                </Can>
              )}
              {payCode && (
                <Can do={[PermissionEnum.AbsVacViewPayCode]}>
                  <Grid item xs={accountingCodeAllocations ? 6 : 12}>
                    <Typography variant={"h6"}>{t("Pay code")}</Typography>
                    {payCodesAreTheSame
                      ? payCode.name
                      : t(
                          "Details have different Pay code selections. Click on Edit below to manage."
                        )}
                  </Grid>
                </Can>
              )}
            </Grid>
          )}
        </>
      </>
    );
  }, [absence, classes.requiresSubSection, actingAsEmployee, t]);

  return (
    <div>
      <Grid container alignItems="flex-start" spacing={4}>
        <Grid item xs={vacancySummaryDetails.length > 0 ? 5 : 12} container>
          <Grid item xs={12}>
            <Typography variant="h5">{t("Absence Details")}</Typography>
          </Grid>
          <Grid item xs={12} className={classes.absenceDetailsSection}>
            {absence.employee && (
              <div>
                <Typography variant="h6">
                  <EmployeeLink orgUserId={absence.employee.id}>
                    {`${absence.employee.firstName} ${absence.employee.lastName}`}
                  </EmployeeLink>
                </Typography>
              </div>
            )}

            <AbsenceDetailsOverview absence={absence} />

            <div className={classes.dates}>
              <CreateAbsenceCalendar
                monthNavigation={false}
                currentMonth={parseISO(absence.startDate)}
                selectedAbsenceDates={absenceDates}
                employeeId={absence.employeeId.toString()}
              />
            </div>

            <div className={classes.notesSection}>
              <Typography variant={"h6"}>
                {t("Notes to administrator")}
              </Typography>
              <Typography className={classes.subText}>
                {t("Can be seen by the administrator and the employee.")}
              </Typography>
              <div className={classes.notesForApprover}>
                {absence.notesToApprover || (
                  <span className={classes.valueMissing}>
                    {t("No Notes Specified")}
                  </span>
                )}
              </div>
            </div>

            {!props.actingAsEmployee && (
              <div className={classes.notesSection}>
                <Typography variant={"h6"}>
                  {t("Administrator comments")}
                </Typography>
                <Typography className={classes.subText}>
                  {t("Can be seen and edited by administrators only.")}
                </Typography>
                <div className={classes.notesForApprover}>
                  {absence.adminOnlyNotes || (
                    <span className={classes.valueMissing}>
                      {t("No Notes Specified")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </Grid>
        </Grid>
        {vacancySummaryDetails.length > 0 && (
          <Grid item xs={7} container>
            <Grid item xs={12}>
              <Typography variant="h5">{t("Substitute Details")}</Typography>
              <Typography className={classes.subText}>
                {t(
                  "These times may not match your schedule exactly depending on district configuration."
                )}
              </Typography>
            </Grid>
            <Grid item container xs={12}>
              <div className={classes.substituteDetailsSection}>
                <VacancySummary
                  vacancySummaryDetails={vacancySummaryDetails}
                  onCancelAssignment={onCancelAssignment}
                  notesForSubstitute={
                    absence.vacancies && absence.vacancies[0]
                      ? absence.vacancies[0].notesToReplacement ?? undefined
                      : undefined
                  }
                  showPayCodes={false}
                  showAccountingCodes={false}
                  isAbsence={true}
                  readOnly={true}
                  absenceActions={subDetailsAbsenceInfo}
                />
              </div>
            </Grid>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  absenceDetailsSection: {
    marginTop: theme.spacing(),
  },
  substituteDetailsSection: {
    width: "100%",
    marginTop: theme.spacing(2),
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderRadius: theme.typography.pxToRem(4),
  },
  dates: {
    marginTop: theme.spacing(2),
  },
  notesSection: {
    marginTop: theme.spacing(2),
  },
  notesForApprover: {
    wordBreak: "break-word",
    marginTop: theme.spacing(),
    paddingRight: theme.spacing(6),
  },
  requiresSubSection: {
    marginBottom: theme.spacing(2),
  },
  subText: {
    color: theme.customColors.darkGray,
  },
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));

const getFirstPayCode = (
  absence: Absence
): Pick<PayCode, "id" | "name"> | undefined | null => {
  const firstVacancyDetail = getFirstVacancyDetail(absence);
  return firstVacancyDetail?.payCode;
};

const allPayCodeSelectionsAreTheSame = (
  payCodeToCompare: Pick<PayCode, "id" | "name">,
  absence: Absence
) => {
  const allDetails = getAllVacancyDetails(absence);
  if (!allDetails) {
    return true;
  }

  const mismatch = allDetails.find(x => x.payCode?.id !== payCodeToCompare.id);
  return !mismatch;
};

const getFirstSetOfAccountingCodeAllocations = (
  absence: Absence
): VacancyDetailAccountingCode[] | undefined | null => {
  const firstVacancyDetail = getFirstVacancyDetail(absence);
  return firstVacancyDetail?.accountingCodeAllocations;
};

const allAccountingCodeSelectionsAreTheSame = (
  accountingCodeAllocationsToCompare: VacancyDetailAccountingCode[],
  absence: Absence
) => {
  const allDetails = getAllVacancyDetails(absence);
  if (!allDetails) {
    return true;
  }

  const allDetailsAllocations = allDetails.map(d =>
    d.accountingCodeAllocations.map(a => {
      return { accountingCodeId: a.accountingCodeId, allocation: a.allocation };
    })
  );
  return accountingCodeAllocationsAreTheSame(
    accountingCodeAllocationsToCompare.map(a => {
      return { accountingCodeId: a.accountingCodeId, allocation: a.allocation };
    }),
    allDetailsAllocations
  );
};

const getFirstVacancyDetail = (absence: Absence) => {
  const allDetails = getAllVacancyDetails(absence);
  return allDetails ? allDetails[0] : undefined;
};

const getAllVacancyDetails = (absence: Absence) => {
  const hasVacancyDetails =
    absence.vacancies && absence.vacancies[0] && absence.vacancies[0].details;
  return hasVacancyDetails ? absence.vacancies![0]!.details : undefined;
};

type AbsenceDetailsOverviewProps = {
  absence: Absence;
};

type AbsenceDetailsGroup = {
  dates: Date[];
  absenceReasonId: string;
  absenceReasonName: string;
  dayPart?: DayPart;
  dayPartLabel: string;
  startTime?: string;
  endTime?: string;
};

const AbsenceDetailsOverview: React.FC<AbsenceDetailsOverviewProps> = props => {
  const { absence } = props;
  const absenceReasons = useAbsenceReasons(absence.orgId);

  if (!absence.details) {
    return null;
  }

  // Put the details in order by start date and time
  const sortedAbsenceDetails = compact(absence.details)
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  const groups = sortedAbsenceDetails.reduce(
    (accumulator: AbsenceDetailsGroup[], detail: AbsenceDetail) => {
      const currentGroup = accumulator[accumulator.length - 1];
      const detailAbsenceReasonId = (detail.reasonUsages ?? [])[0]
        ?.absenceReasonId;
      const detailStartTime = format(parseISO(detail.startTimeLocal), "h:mm a");
      const detailEndTime = format(parseISO(detail.endTimeLocal), "h:mm a");

      const detailDate = parseISO(detail.startTimeLocal);
      if (
        currentGroup?.absenceReasonId === detailAbsenceReasonId &&
        currentGroup?.dayPart === detail.dayPartId &&
        currentGroup?.startTime === detailStartTime &&
        currentGroup?.endTime === detailEndTime
      ) {
        currentGroup.dates.push(detailDate);
      } else {
        accumulator.push({
          dates: [detailDate],
          absenceReasonId: detailAbsenceReasonId ?? "",
          absenceReasonName:
            absenceReasons.find(a => a.id === detailAbsenceReasonId)?.name ??
            "",
          dayPart: detail.dayPartId ?? undefined,
          dayPartLabel: detail.dayPartId
            ? dayPartToLabel(detail.dayPartId)
            : "",
          startTime: detailStartTime,
          endTime: detailEndTime,
        });
      }
      return accumulator;
    },
    []
  );

  return (
    <>
      {groups.map((g, i) => {
        return (
          <div key={i}>
            <Typography variant="h6">
              {getDateRangeDisplayTextWithDayOfWeekForContiguousDates(g.dates)}
            </Typography>
            <div>
              {`${g.absenceReasonName} - ${g.dayPartLabel} (${g.startTime} - ${g.endTime})`}
            </div>
          </div>
        );
      })}
    </>
  );
};
