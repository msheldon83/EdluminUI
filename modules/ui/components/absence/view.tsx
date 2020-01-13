import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { isSameDay, parseISO } from "date-fns";
import { useMutationBundle } from "graphql/hooks";
import {
  Absence,
  AbsenceReason,
  AccountingCode,
  PayCode,
  Vacancy,
} from "graphql/server-types.gen";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { useScreenSize } from "hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { some } from "lodash-es";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { CustomCalendar } from "../form/custom-calendar";
import { AssignedSub } from "./assigned-sub";
import { getAbsenceDateRangeDisplayText } from "./date-helpers";
import { CancelAssignment } from "./graphql/cancel-assignment.gen";
import {
  dayPartToLabel,
  getAbsenceDetailsGrouping,
  getReplacementEmployeeForVacancy,
  ReplacementEmployeeForVacancy,
} from "./helpers";
import { VacancyDetails } from "./vacancy-details";

type Props = {
  orgId: string;
  absence: Absence;
  isConfirmation?: boolean;
  isAdmin: boolean;
};

export const View: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const { openSnackbar } = useSnackbar();
  const absenceReasons = useAbsenceReasons(props.orgId);

  const absence = props.absence;
  const absenceStartDate = useMemo(() => new Date(absence.startDate), [
    absence.startDate,
  ]);

  const absenceDates = useMemo(
    () => absence.details?.map(d => parseISO(d?.startDate)) ?? [],
    [absence.details]
  );

  const allDisabled = useEmployeeDisabledDates(
    absence.employeeId.toString(),
    absenceStartDate
  );

  const disabledDates = useMemo(
    () =>
      allDisabled.filter(
        disabled => !some(absenceDates, ad => isSameDay(ad, disabled.date))
      ),
    [absenceDates, allDisabled]
  );

  const [
    replacementEmployeeInformation,
    setReplacementEmployeeInformation,
  ] = useState<ReplacementEmployeeForVacancy | null>(
    getReplacementEmployeeForVacancy(absence)
  );

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });

  if (!absence) {
    return null;
  }

  const removeSub = async (
    employeeId: number,
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => {
    const result = await cancelAssignment({
      variables: {
        cancelRequest: {
          assignmentId: assignmentId ?? "",
          rowVersion: assignmentRowVersion ?? "",
        },
      },
    });
  };

  const hasVacancies = absence.vacancies && absence.vacancies.length > 0;
  const notesToReplacement =
    absence.vacancies && absence.vacancies[0]
      ? absence.vacancies[0].notesToReplacement
      : undefined;
  const payCode = getPayCode(absence);
  const accountingCode = getAccountingCode(absence);

  const customDatesDisabled = disabledDates.map(({ date }) => {
    return {
      date,
      buttonProps: { className: classes.dateDisabled },
    };
  });

  const customAbsenceDates = absenceDates.map(date => {
    return {
      date,
      buttonProps: { className: classes.absenceDate },
    };
  });

  return (
    <div>
      <Grid container alignItems="flex-start" spacing={4}>
        <Grid item xs={hasVacancies ? 5 : 12} container>
          <Grid item xs={12}>
            <Typography variant="h5">{t("Absence Details")}</Typography>
          </Grid>
          <Grid item xs={12} className={classes.absenceDetailsSection}>
            <div>
              {getAbsenceReasonListDisplay(
                absence,
                absenceReasons,
                disabledDates,
                classes
              )}
            </div>

            <div className={classes.dates}>
              <CustomCalendar
                month={parseISO(absence.startDate)}
                customDates={customDatesDisabled.concat(customAbsenceDates)}
                variant="month"
              />
            </div>

            <div className={classes.notesToApproverSection}>
              <Typography variant={"h6"}>
                {t("Notes for administrator")}
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
          </Grid>
        </Grid>
        {hasVacancies && (
          <Grid item xs={7} container>
            <Grid item xs={12}>
              <Typography variant="h5">{t("Substitute Details")}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.substituteDetailsSection}>
                {replacementEmployeeInformation && (
                  <AssignedSub
                    employeeId={replacementEmployeeInformation.employeeId}
                    employeeName={`${replacementEmployeeInformation.firstName} ${replacementEmployeeInformation.lastName}`}
                    subText={
                      props.isConfirmation ? t("pre-arranged") : t("assigned")
                    }
                    assignmentId={replacementEmployeeInformation.assignmentId}
                    assignmentRowVersion={
                      replacementEmployeeInformation.assignmentRowVersion
                    }
                    onRemove={async (...props) => {
                      await removeSub(...props);
                      setReplacementEmployeeInformation(null);
                    }}
                  />
                )}
                <div className={classes.vacancyDetails}>
                  <div className={classes.requiresSubSection}>
                    <Typography variant="h6">
                      {t("Requires a substitute")}
                    </Typography>
                  </div>
                  {absence.vacancies && (
                    <>
                      <VacancyDetails
                        vacancies={absence.vacancies as Vacancy[]}
                        equalWidthDetails
                        disabledDates={disabledDates}
                      />
                      <>
                        {props.isAdmin && (accountingCode || payCode) && (
                          <Grid item container className={classes.subCodes}>
                            {accountingCode && (
                              <Grid item xs={payCode ? 6 : 12}>
                                <Typography variant={"h6"}>
                                  {t("Accounting code")}
                                </Typography>
                                {accountingCode.name}
                              </Grid>
                            )}
                            {payCode && (
                              <Grid item xs={accountingCode ? 6 : 12}>
                                <Typography variant={"h6"}>
                                  {t("Pay code")}
                                </Typography>
                                {payCode.name}
                              </Grid>
                            )}
                          </Grid>
                        )}
                      </>
                    </>
                  )}
                  <div className={classes.notesForSubSection}>
                    <Typography variant={"h6"}>
                      {t("Notes for substitute")}
                    </Typography>
                    <Typography className={classes.subText}>
                      {t(
                        "Can be seen by the substitute, administrator and employee."
                      )}
                    </Typography>
                    <div className={classes.notesForSub}>
                      {notesToReplacement || (
                        <span className={classes.valueMissing}>
                          {t("No Notes Specified")}
                        </span>
                      )}
                    </div>
                  </div>
                  {!props.isConfirmation && (
                    <div className={classes.edit}>
                      <Button variant="outlined" onClick={() => {}}>
                        {t("Edit")}
                      </Button>
                    </div>
                  )}
                </div>
              </Paper>
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
    marginTop: theme.spacing(2),
  },
  vacancyDetails: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  absenceReasonDetails: {
    fontWeight: "bold",
  },
  dates: {
    marginTop: theme.spacing(2),
  },
  notesToApproverSection: {
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
  subCodes: {
    marginTop: theme.spacing(4),
  },
  notesForSubSection: {
    marginTop: theme.spacing(4),
  },
  notesForSub: {
    wordBreak: "break-word",
    marginTop: theme.spacing(),
  },
  subText: {
    color: theme.customColors.darkGray,
  },
  edit: {
    marginTop: theme.spacing(4),
  },
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
  dateDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  absenceDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
}));

/* TODO: Currently we are assuming that there is only 1 Absence Reason in
    use per Absence Detail. As we build in support for more complicated
    Absences, we will have to revisit this.
*/
const getAbsenceReasonListDisplay = (
  absence: Absence,
  absenceReasons: Pick<AbsenceReason, "id" | "name">[],
  disabledDates: DisabledDate[],
  classes: any
) => {
  const detailsGrouping = getAbsenceDetailsGrouping(absence);
  if (detailsGrouping === null || !detailsGrouping.length) {
    return null;
  }

  return detailsGrouping.map((d, groupIndex) => {
    const matchingAbsenceReason = absenceReasons.find(
      a => a.id === d.absenceReasonId?.toString()
    );
    const allDates = d.detailItems.map(di => di.date);

    return (
      <div key={groupIndex}>
        <div className={classes.absenceReasonDetails}>
          {matchingAbsenceReason?.name}
        </div>
        <Typography variant="h6">
          {getAbsenceDateRangeDisplayText(allDates, disabledDates)}
        </Typography>
        {d.simpleDetailItems &&
          d.simpleDetailItems.map((di, detailIndex) => {
            return (
              <div key={detailIndex} className={classes.absenceReasonDetails}>
                {`${dayPartToLabel(di.dayPart)} (${di.startTime} - ${
                  di.endTime
                })`}
              </div>
            );
          })}
      </div>
    );
  });
};

/* TODO: Currently we only allow you to specify a single Pay Code on the Absence screen
    that applies to all Vacancy Details. When we allow a User to specify different Pay Codes
    per Vacancy Detail, we will have to revisit this.
*/
const getPayCode = (
  absence: Absence
): Pick<PayCode, "id" | "name"> | undefined | null => {
  const hasVacancyDetail =
    absence.vacancies &&
    absence.vacancies[0] &&
    absence.vacancies[0].details &&
    absence.vacancies[0].details[0];
  if (!hasVacancyDetail) {
    return undefined;
  }

  const firstVacancyDetail = absence.vacancies![0]!.details![0];
  if (!firstVacancyDetail) {
    return undefined;
  }

  return firstVacancyDetail.payCode;
};

/* TODO: Currently we only allow you to specify a single Accounting Code on the Absence screen
    that applies to all Vacancy Details. When we allow a User to specify different Accounting Codes
    (and allocations) per Vacancy Detail, we will have to revisit this.
*/
const getAccountingCode = (
  absence: Absence
): Pick<AccountingCode, "id" | "name"> | undefined | null => {
  const hasVacancyDetail =
    absence.vacancies &&
    absence.vacancies[0] &&
    absence.vacancies[0].details &&
    absence.vacancies[0].details[0];
  if (!hasVacancyDetail) {
    return undefined;
  }

  const firstVacancyDetail = absence.vacancies![0]!.details![0];
  if (!firstVacancyDetail) {
    return undefined;
  }

  if (
    !firstVacancyDetail.accountingCodeAllocations ||
    !firstVacancyDetail.accountingCodeAllocations[0]
  ) {
    return undefined;
  }

  return firstVacancyDetail.accountingCodeAllocations[0].accountingCode;
};
