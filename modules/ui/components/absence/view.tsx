import { Button, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { isSameDay, parseISO } from "date-fns";
import { useMutationBundle } from "graphql/hooks";
import {
  Absence,
  AbsenceReason,
  AccountingCode,
  PayCode,
  PermissionEnum,
  Vacancy,
  VacancyDetailAccountingCode,
} from "graphql/server-types.gen";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { useSnackbar } from "hooks/use-snackbar";
import { some, flatMap, compact } from "lodash-es";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { Can } from "../auth/can";
import { AssignedSub } from "./assigned-sub";
import { CreateAbsenceCalendar } from "./create-absence-calendar";
import { getDateRangeDisplayTextWithDayOfWeekForContiguousDates } from "ui/components/date-helpers";
import { CancelAssignment } from "./graphql/cancel-assignment.gen";
import {
  dayPartToLabel,
  getAbsenceDetailsGrouping,
  getReplacementEmployeeForVacancy,
  ReplacementEmployeeForVacancy,
  getCannotCreateAbsenceDates,
} from "./helpers";
import { VacancyDetails } from "./vacancy-details";
import { ShowErrors } from "../error-helpers";
import { AssignmentOnDate } from "./types";
import { EmployeeLink } from "ui/components/links/people";
import { accountingCodeAllocationsAreTheSame } from "../absence-vacancy/helpers";

type Props = {
  orgId: string;
  absence: Absence;
  isConfirmation?: boolean;
  actingAsEmployee?: boolean;
  goToEdit?: Function;
};

export const View: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
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
      getCannotCreateAbsenceDates(allDisabled).filter(
        disabled => !some(absenceDates, ad => isSameDay(ad, disabled))
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
      ShowErrors(error, openSnackbar);
    },
  });

  const vacancies = useMemo(() => {
    const vacancies = absence?.vacancies?.filter(v => !!v).map(v => v!) ?? [];
    return vacancies;
  }, [absence]);

  const assignmentStartTime = useMemo(() => {
    const details = vacancies[0] ? vacancies[0].details : [];
    const startTime =
      details && details[0] ? details[0].startTimeLocal : undefined;
    return startTime ? parseISO(startTime) : undefined;
  }, [vacancies]);

  if (!absence) {
    return null;
  }

  const removeSub = async (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[]
  ) => {
    const result = await cancelAssignment({
      variables: {
        cancelRequest: {
          assignmentId: assignmentId ?? "",
          rowVersion: assignmentRowVersion ?? "",
          vacancyDetailIds: vacancyDetailIds ?? undefined,
        },
      },
    });

    const removedSuccessfully = !!result?.data?.assignment?.cancelAssignment
      ?.id;
    if (
      removedSuccessfully &&
      props.goToEdit &&
      vacancyDetailIds &&
      vacancyDetailIds.length > 0
    ) {
      // Determine if the Sub was only removed from part of the day
      // and if so, redirect the User to the Edit view of the Absence
      const allVacancyDetailIds = compact(
        flatMap(vacancies.map(v => v?.details?.map(d => d?.id)))
      );
      if (vacancyDetailIds.length !== allVacancyDetailIds.length) {
        props.goToEdit();
      }
    }
  };

  const hasVacancies = absence.vacancies && absence.vacancies.length > 0;
  const notesToReplacement =
    absence.vacancies && absence.vacancies[0]
      ? absence.vacancies[0].notesToReplacement
      : undefined;
  const payCode = getFirstPayCode(absence);
  const payCodesAreTheSame = payCode
    ? allPayCodeSelectionsAreTheSame(payCode, absence)
    : true;
  const accountingCodeAllocations = getFirstSetOfAccountingCodeAllocations(
    absence
  );
  const accountingCodeAllocationsAreTheSame = accountingCodeAllocations
    ? allAccountingCodeSelectionsAreTheSame(accountingCodeAllocations, absence)
    : true;
  const multipleAccountingCodeAllocations =
    (accountingCodeAllocations ?? []).length > 1;

  return (
    <div>
      <Grid container alignItems="flex-start" spacing={4}>
        <Grid item xs={hasVacancies ? 5 : 12} container>
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

            <div>
              {getAbsenceReasonListDisplay(
                absence,
                absenceReasons,
                disabledDates,
                classes
              )}
            </div>

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
        {hasVacancies && (
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
                  onCancelAssignment={async (
                    assignmentId?: string,
                    assignmentRowVersion?: string,
                    vacancyDetailIds?: string[]
                  ) => {
                    await removeSub(
                      assignmentId,
                      assignmentRowVersion,
                      vacancyDetailIds
                    );
                    setReplacementEmployeeInformation(null);
                  }}
                  assignmentStartDate={assignmentStartTime ?? absenceStartDate}
                  vacancies={vacancies}
                  assignmentsByDate={[]}
                  shouldLink={true}
                />
              )}
              <div className={classes.substituteDetailsSection}>
                {absence.vacancies && (
                  <>
                    <VacancyDetails
                      vacancies={absence.vacancies as Vacancy[]}
                      equalWidthDetails
                      disabledDates={disabledDates}
                      onCancelAssignment={async (
                        assignmentId?: string,
                        assignmentRowVersion?: string
                      ) => {
                        await removeSub(assignmentId, assignmentRowVersion);
                        setReplacementEmployeeInformation(null);
                      }}
                      assignmentsByDate={[]}
                    />
                    <div className={classes.requiresSubSection}>
                      <Typography variant="h6">
                        {t("Requires a substitute")}
                      </Typography>
                    </div>
                    <>
                      {!props.actingAsEmployee &&
                        (accountingCodeAllocations || payCode) && (
                          <Grid item container className={classes.subCodes}>
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
                                              ? `(${Math.floor(
                                                  a.allocation * 100
                                                )}%)`
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
                                <Grid
                                  item
                                  xs={accountingCodeAllocations ? 6 : 12}
                                >
                                  <Typography variant={"h6"}>
                                    {t("Pay code")}
                                  </Typography>
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
  absenceReasonDetails: {
    fontWeight: "bold",
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
    padding: theme.spacing(2),
  },
  subCodes: {
    padding: theme.spacing(2),
  },
  notesForSubSection: {
    padding: theme.spacing(2),
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
}));

/* TODO: Currently we are assuming that there is only 1 Absence Reason in
    use per Absence Detail. As we build in support for more complicated
    Absences, we will have to revisit this.
*/
const getAbsenceReasonListDisplay = (
  absence: Absence,
  absenceReasons: Pick<AbsenceReason, "id" | "name">[],
  disabledDates: Date[],
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
          {getDateRangeDisplayTextWithDayOfWeekForContiguousDates(
            allDates,
            disabledDates
          )}
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
