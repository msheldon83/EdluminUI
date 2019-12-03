import * as React from "react";
import { Grid, makeStyles, Typography, Button, Paper } from "@material-ui/core";
import {
  Absence,
  Vacancy,
  AbsenceReason,
  AccountingCode,
  PayCode,
} from "graphql/server-types.gen";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { VacancyDetails } from "./vacancy-details";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { Calendar } from "../form/calendar";
import { getDateRangeDisplayText } from "helpers/date";
import {
  dayPartToLabel,
  getReplacementEmployeeForVacancy,
  ReplacementEmployeeForVacancy,
  getAbsenceDetailsGrouping,
} from "./helpers";
import { AssignedSub } from "./assigned-sub";
import { useState } from "react";
import { useSnackbar } from "hooks/use-snackbar";
import { useMutationBundle } from "graphql/hooks";
import { CancelAssignment } from "./graphql/cancel-assignment.gen";

type Props = {
  orgId: string;
  absence: Absence | undefined;
  isConfirmation?: boolean;
  disabledDates: Date[];
  isAdmin: boolean;
};

export const View: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const { openSnackbar } = useSnackbar();
  const absenceReasons = useAbsenceReasons(props.orgId);

  const absence = props.absence;
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
          id: Number(assignmentId) ?? "",
          rowVersion: assignmentRowVersion ?? "",
        },
      },
    });
  };

  const hasVacancies = absence.vacancies && absence.vacancies.length;
  const notesToReplacement =
    absence.vacancies && absence.vacancies[0]
      ? absence.vacancies[0].notesToReplacement
      : undefined;
  const payCode = getPayCode(absence);
  const accountingCode = getAccountingCode(absence);

  return (
    <div>
      <Grid container alignItems="flex-start" spacing={4}>
        <Grid item xs={hasVacancies ? 5 : 12} container>
          <Grid item xs={12}>
            <Typography variant="h5">{t("Absence Details")}</Typography>
          </Grid>
          <Grid item xs={12} className={classes.absenceDetailsSection}>
            <div>
              {getAbsenceReasonListDisplay(absence, absenceReasons, classes)}
            </div>

            <div className={classes.dates}>
              <Calendar
                startDate={new Date(`${absence.startDate} 00:00`)}
                endDate={new Date(`${absence.endDate} 00:00`)}
                range={true}
                disableDays={true}
                disabledDates={props.disabledDates}
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
                  {props.isConfirmation && (
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

    return (
      <div key={groupIndex}>
        <div className={classes.absenceReasonDetails}>
          {matchingAbsenceReason?.name}
        </div>
        <Typography variant="h6">
          {getDateRangeDisplayText(d.startDate, d.endDate ?? new Date())}
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
