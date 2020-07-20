import * as React from "react";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import {
  NeedsReplacement,
  PermissionEnum,
  AbsenceUpdateInput,
  AbsenceCreateInput,
  DayPart,
  AbsenceDetailCreateInput,
  Absence,
  Vacancy,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { AbsenceState, absenceReducer } from "../state";
import { PageTitle } from "ui/components/page-title";
import * as yup from "yup";
import { StepParams } from "helpers/step-params";
import { useQueryParamIso } from "hooks/query-params";
import { AbsenceFormData, AbsenceDetail } from "../types";
import { Formik } from "formik";
import {
  validateAccountingCodeAllocations,
  mapAccountingCodeValueToAccountingCodeAllocations,
} from "helpers/accounting-code-allocations";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { Section } from "ui/components/section";
import { makeStyles, Grid, Typography, Button } from "@material-ui/core";
import { AbsenceDetails } from "./absence-details";
import {
  startOfMonth,
  isSameDay,
  format,
  isBefore,
  startOfDay,
  min,
  isEqual,
  parseISO,
} from "date-fns";
import { SubstituteDetails } from "./substitute-details";
import { ContentFooter } from "ui/components/content-footer";
import { Can, useCanDo } from "ui/components/auth/can";
import {
  getAbsenceDates,
  getCannotCreateAbsenceDates,
  vacancyDetailsHaveDifferentAccountingCodeSelections,
  vacancyDetailsHaveDifferentPayCodeSelections,
} from "ui/components/absence/helpers";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { some, sortBy } from "lodash-es";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canEditAbsVac } from "helpers/permissions";
import { ErrorBanner } from "ui/components/error-banner";
import { AssignSub } from "ui/components/assign-sub";
import { EditVacancies } from "ui/pages/create-absence/edit-vacancies";
import { VacancyDetail } from "ui/components/absence/types";
import { convertStringToDate } from "helpers/date";
import { Confirmation } from "../create/confirmation";
import { ApolloError } from "apollo-client";
import { ErrorDialog } from "ui/components/error-dialog";

type Props = {
  organizationId: string;
  actingAsEmployee: boolean;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    locationIds: string[];
  };
  position?: {
    id: string;
    needsReplacement: NeedsReplacement;
    title: string;
    positionTypeId?: string;
    defaultPayCodeId?: string;
    defaultAccountingCodeAllocations: AccountingCodeValue;
  };
  initialAbsenceData: AbsenceFormData;
  saveAbsence: (
    data: AbsenceCreateInput | AbsenceUpdateInput
  ) => Promise<Absence>;
  saveErrorsInfo: { error: ApolloError | null; confirmed: boolean } | undefined;
  onErrorsConfirmed: () => void;
  deleteAbsence?: () => void;
};

export const AbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const canDoFn = useCanDo();
  const [step, setStep] = useQueryParamIso(StepParams);
  const {
    actingAsEmployee,
    organizationId,
    employee,
    position,
    initialAbsenceData,
    saveAbsence,
    deleteAbsence,
    saveErrorsInfo,
    onErrorsConfirmed,
  } = props;
  const [absence, setAbsence] = React.useState<Absence | undefined>();

  const initialState = (props: Props): AbsenceState => {
    const absenceDates = initialAbsenceData.details.map(d => d.date);
    const viewingCalendarMonth =
      absenceDates.length > 0
        ? startOfMonth(absenceDates[0])
        : startOfMonth(new Date());
    return {
      employeeId: employee.id,
      organizationId: organizationId,
      positionId: position?.id ?? "0",
      viewingCalendarMonth,
      absenceDates,
      closedDates: [],
      vacancySummaryDetailsToAssign: [],
    };
  };

  const [state, dispatch] = React.useReducer(
    absenceReducer,
    props,
    initialState
  );
  const isCreate = !state.absenceId;

  const disabledDatesObjs = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );
  const disabledDates = React.useMemo(
    () => getCannotCreateAbsenceDates(disabledDatesObjs),
    [disabledDatesObjs]
  );

  React.useEffect(() => {
    const conflictingDates = disabledDates.filter(dis =>
      some(state.absenceDates, ad => isSameDay(ad, dis))
    );
    if (conflictingDates.length > 0) {
      dispatch({ action: "removeAbsenceDates", dates: conflictingDates });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledDates]);

  const canSaveAbsence = React.useCallback(
    (absenceDetails: AbsenceDetail[]) => {
      if (isCreate) {
        return true;
      }

      const absenceDates = absenceDetails.map(ad => ad.date);
      return canDoFn(
        (
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string,
          forRole?: Role | null | undefined
        ) =>
          canEditAbsVac(
            startOfDay(min(absenceDates)),
            permissions,
            isSysAdmin,
            orgId,
            actingAsEmployee ? "employee" : "admin"
            //props.approvalStatus
          )
      );
    },
    [actingAsEmployee, canDoFn, isCreate]
  );

  const onProjectedVacanciesChange = React.useCallback(
    (vacancies: Vacancy[]) => {
      dispatch({
        action: "setProjectedVacancies",
        projectedVacancies: vacancies,
      });
    },
    []
  );

  const onChangedVacancies = React.useCallback(
    (vacancyDetails: VacancyDetail[]) => {
      console.log(vacancyDetails);

      setStep("absence");
      dispatch({
        action: "setVacanciesInput",
        input: vacancyDetails,
      });
    },
    [setStep]
  );

  // --- Handling of Sub pre-arrange, assignment, or removal ------

  const onCancelAssignment = React.useCallback(
    async (vacancyDetailIds?: string[], vacancyDetailDates?: Date[]) => {
      // Get all of the matching details
      const vacancyDetails =
        state.customizedVacanciesInput ?? state.projectedVacancyDetails;
      const detailsToCancelAssignmentsFor =
        vacancyDetailIds && vacancyDetailIds.length > 0
          ? vacancyDetails?.filter(d =>
              vacancyDetailIds.find(i => i === d.vacancyDetailId)
            )
          : vacancyDetails?.filter(d =>
              vacancyDetailDates?.find(date =>
                isSameDay(date, new Date(d.startTime))
              )
            );

      if (
        !detailsToCancelAssignmentsFor ||
        detailsToCancelAssignmentsFor.length === 0
      ) {
        return;
      }

      //const updatedDetails = [...vacancy.details];
      const localDetailIdsToClearAssignmentsOn: string[] = [];
      if (!isCreate) {
        // // Get all of the Assignment Ids and Row Versions to Cancel
        // const assignmentsToCancel: CancelVacancyAssignmentInput[] = detailsToCancelAssignmentsFor.reduce(
        //   (accumulator: CancelVacancyAssignmentInput[], detail) => {
        //     const matchingAssignment = accumulator.find(
        //       a => a.assignmentId === detail.assignment?.id
        //     );
        //     if (matchingAssignment) {
        //       matchingAssignment.vacancyDetailIds?.push(detail.id!);
        //     } else {
        //       accumulator.push({
        //         assignmentId: detail.assignment?.id ?? "",
        //         rowVersion: detail.assignment?.rowVersion ?? "",
        //         vacancyDetailIds: [detail.id!],
        //       });
        //     }
        //     return accumulator;
        //   },
        //   []
        // );
        // for (let index = 0; index < assignmentsToCancel.length; index++) {
        //   const a = assignmentsToCancel[index];
        //   const result = await cancelAssignment({
        //     variables: {
        //       assignment: a,
        //     },
        //   });
        //   if (result?.data) {
        //     if (a.vacancyDetailIds) {
        //       localDetailIdsToClearAssignmentsOn.push(...a.vacancyDetailIds);
        //     }
        //     updatedDetails
        //       .filter(
        //         d =>
        //           d.assignment?.id &&
        //           d.assignment?.id ===
        //             result?.data?.assignment?.cancelAssignment?.id
        //       )
        //       .forEach(d => {
        //         if (d.assignment) {
        //           d.assignment.rowVersion =
        //             result.data?.assignment?.cancelAssignment?.rowVersion;
        //         }
        //       });
        //   }
        // }
      } else {
        dispatch({
          action: "updateAssignments",
          assignments: detailsToCancelAssignmentsFor.map(d => {
            return {
              startTimeLocal: parseISO(d.startTime),
              vacancyDetailId: d.vacancyDetailId,
              employee: {
                id: d.assignmentEmployeeId ?? "",
                firstName: d.assignmentEmployeeFirstName ?? "",
                lastName: d.assignmentEmployeeLastName ?? "",
              },
            };
          }),
          add: false,
        });
      }
    },
    [isCreate, state.customizedVacanciesInput, state.projectedVacancyDetails]
  );

  const onAssignSub = React.useCallback(
    async (
      replacementEmployeeId: string,
      replacementEmployeeFirstName: string,
      replacementEmployeeLastName: string,
      payCode: string | undefined,
      vacancyDetailIds?: string[],
      vacancyDetailDates?: Date[]
    ) => {
      const vacancyDetails =
        state.customizedVacanciesInput ?? state.projectedVacancyDetails;

      // Get all of the matching details
      const detailsToAssign = vacancyDetailIds
        ? vacancyDetails?.filter(d =>
            vacancyDetailIds.find(i => i === d.vacancyDetailId)
          )
        : vacancyDetails?.filter(d =>
            vacancyDetailDates?.find(date =>
              isSameDay(date, parseISO(d.startTime))
            )
          );

      console.log(detailsToAssign);

      if (!detailsToAssign || detailsToAssign.length === 0) {
        setStep("absence");
        return;
      }

      if (!isCreate) {
        // // Cancel any existing assignments on these Details
        // await onCancelAssignment(vacancyDetailIds);
        // // Create an Assignment for these Details
        // const result = await assignVacancy({
        //   variables: {
        //     assignment: {
        //       orgId: params.organizationId,
        //       vacancyId: vacancy.id,
        //       employeeId: replacementEmployeeId,
        //       vacancyDetailIds: detailsToAssign.map(d => d.id!),
        //     },
        //   },
        // });
        // const assignment = result?.data?.vacancy?.assignVacancy as Assignment;
        // if (assignment) {
        //   setVacancy({
        //     ...vacancy,
        //     details: vacancy.details.map(d => {
        //       if (!vacancyDetailIds?.find(i => d.id === i)) {
        //         return d;
        //       }
        //       return {
        //         ...d,
        //         assignment: {
        //           id: assignment.id,
        //           rowVersion: assignment.rowVersion,
        //           employee: {
        //             id: replacementEmployeeId,
        //             firstName: replacementEmployeeFirstName,
        //             lastName: replacementEmployeeLastName,
        //           },
        //         },
        //       };
        //     }),
        //   });
        // }
      } else {
        dispatch({
          action: "updateAssignments",
          assignments: detailsToAssign.map(d => {
            return {
              startTimeLocal: parseISO(d.startTime),
              vacancyDetailId: d.vacancyDetailId,
              employee: {
                id: replacementEmployeeId,
                firstName: replacementEmployeeFirstName,
                lastName: replacementEmployeeLastName,
              },
            };
          }),
          add: true,
        });
      }

      setStep("absence");
    },
    [
      isCreate,
      setStep,
      state.customizedVacanciesInput,
      state.projectedVacancyDetails,
    ]
  );

  const onOverallCodeChanges = React.useCallback(
    (accountingCodeValue?: AccountingCodeValue, payCodeId?: string | null) => {
      if (
        accountingCodeValue &&
        (accountingCodeValue.type !== "multiple-allocations" ||
          accountingCodeValue.allocations.length > 0)
      ) {
        dispatch({
          action: "setAccountingCodesOnAllCustomVacancyDetails",
          accountingCodeValue,
        });
      }

      if (payCodeId === null || payCodeId) {
        dispatch({
          action: "setPayCodeOnAllCustomVacancyDetails",
          payCodeId,
        });
      }
    },
    []
  );

  const save = React.useCallback(
    async (formValues: AbsenceFormData, ignoreWarnings?: boolean) => {
      let absenceInput = buildAbsenceInput(
        formValues,
        state,
        disabledDates,
        false
      );

      if (!absenceInput) {
        return;
      }

      if (ignoreWarnings) {
        absenceInput = {
          ...absenceInput,
          ignoreWarnings: true,
        };
      }

      const absence = await saveAbsence(absenceInput);
      console.log(absence);
      if (!absence) {
        return;
      }

      setAbsence(absence);
      if (isCreate) {
        setStep("confirmation");
      }
    },
    [disabledDates, isCreate, saveAbsence, setStep, state]
  );

  return (
    <>
      <PageTitle
        title={isCreate ? t("Create absence") : t("Edit absence")}
        withoutHeading
      />
      <Formik
        initialValues={initialAbsenceData}
        validationSchema={yup.object().shape({
          details: yup.array().of(
            yup.object().shape({
              absenceReasonId: yup
                .string()
                .nullable()
                .required(t("Required")),
              dayPart: yup
                .string()
                .nullable()
                .required(t("Required")),
              hourlyStartTime: yup.string().when("dayPart", {
                is: DayPart.Hourly,
                then: yup.string().required(t("Required")),
              }),
              hourlyEndTime: yup.string().when("dayPart", {
                is: DayPart.Hourly,
                then: yup.string().required(t("Required")),
              }),
            })
          ),
          notesToApprover: yup.string().when("requireNotesToApprover", {
            is: true,
            then: yup.string().required(t("Required")),
          }),

          // Notes To Approver if notes are required
          // Accounting Code Allocations

          // accountingCodeAllocations: yup.object().test({
          //   name: "accountingCodeAllocationsCheck",
          //   test: function test(value: AbsenceFormData) {
          //     const accountingCodeAllocations =
          //       value.accountingCodeAllocations;

          //     const error = validateAccountingCodeAllocations(
          //       accountingCodeAllocations ?? [],
          //       t
          //     );
          //     if (!error) {
          //       return true;
          //     }

          //     return new yup.ValidationError(
          //       error,
          //       null,
          //       `${this.path}.accountingCodeAllocations`
          //     );
          //   },
          // })
        })}
        onSubmit={async (data, e) => {
          await save(data);
        }}
      >
        {({
          values,
          handleSubmit,
          handleReset,
          setFieldValue,
          dirty,
          isSubmitting,
          resetForm,
          touched,
          initialValues,
          errors,
        }) => {
          const inputForProjectedCalls = buildAbsenceInput(
            values,
            state,
            disabledDates,
            true
          ) as AbsenceCreateInput;
          console.log("inputForProjectedCalls", inputForProjectedCalls);
          console.log(
            "state.customizedVacanciesInput",
            state.customizedVacanciesInput
          );

          return (
            <>
              <form id="absence-form" onSubmit={handleSubmit}>
                {step === "absence" && (
                  <>
                    <ErrorDialog
open={
  !!(
    saveErrorsInfo?.error && !saveErrorsInfo?.confirmed
  )
}
title={
  isCreate
    ? t("There was an issue creating the absence")
    : t("There was an issue saving the absence")
}
warningsOnlyTitle={t(
  "Hmm, we found a possible issue. Would you like to continue?"
)}
apolloErrors={saveErrorsInfo?.error ?? null}
onClose={onErrorsConfirmed}
continueAction={async () => await save(values, true)}

/>
                    <AbsenceVacancyHeader
                      pageHeader={
                        isCreate ? t("Create absence") : t("Edit absence")
                      }
                      subHeader={
                        !actingAsEmployee
                          ? `${employee.firstName} ${employee.lastName}`
                          : undefined
                      }
                    />
                    <Section className={classes.content}>
                      <Grid container spacing={2}>
                        <Grid item md={5}>
                          <AbsenceDetails
                            organizationId={organizationId}
                            employeeId={employee.id}
                            actingAsEmployee={actingAsEmployee}
                            absenceDates={state.absenceDates}
                            onToggleAbsenceDate={d => {
                              dispatch({ action: "toggleDate", date: d });
                              // Update the details in the form
                              const exists = values.details.find(x =>
                                isSameDay(x.date, d)
                              );
                              if (exists) {
                                setFieldValue(
                                  "details",
                                  values.details.filter(
                                    x => !isSameDay(x.date, d)
                                  ),
                                  false
                                );
                              } else {
                                setFieldValue(
                                  "details",
                                  sortBy(
                                    [
                                      ...values.details,
                                      copyDetail(d, values.details),
                                    ],
                                    d => d.date
                                  ),
                                  false
                                );
                              }
                            }}
                            closedDates={[]}
                            currentMonth={state.viewingCalendarMonth}
                            onSwitchMonth={(d: Date) =>
                              dispatch({ action: "switchMonth", month: d })
                            }
                            absenceInput={inputForProjectedCalls}
                            positionTypeId={position?.positionTypeId}
                            onTimeChange={() => {
                              dispatch({
                                action: "setVacanciesInput",
                                input: undefined,
                              });
                            }}
                          />
                        </Grid>
                        <Grid item md={6}>
                          <SubstituteDetails
                            isCreate={isCreate}
                            organizationId={organizationId}
                            actingAsEmployee={actingAsEmployee}
                            needsReplacement={
                              position?.needsReplacement ?? NeedsReplacement.No
                            }
                            absenceInput={inputForProjectedCalls}
                            onAssignSubClick={vacancySummaryDetailsToAssign => {
                              dispatch({
                                action: "setVacancySummaryDetailsToAssign",
                                vacancySummaryDetailsToAssign,
                              });
                              setStep("preAssignSub");
                            }}
                            onCancelAssignment={onCancelAssignment}
                            onEditSubDetailsClick={() => setStep("edit")}
                            onProjectedVacanciesChange={
                              onProjectedVacanciesChange
                            }
                            assignmentsByDate={state.assignmentsByDate}
                            onOverallCodeChanges={({
                              accountingCodeValue,
                              payCodeId,
                            }) =>
                              onOverallCodeChanges(
                                accountingCodeValue,
                                payCodeId
                              )
                            }
                          />
                        </Grid>
                      </Grid>
                    </Section>
                    <ContentFooter>
                      <Grid item xs={12} className={classes.contentFooter}>
                        <div className={classes.actionButtons}>
                          <div className={classes.unsavedText}>
                            {(dirty || isCreate) && (
                              <Typography>
                                {t("This page has unsaved changes")}
                              </Typography>
                            )}
                          </div>
                          {deleteAbsence && !dirty && (
                            <Can do={[PermissionEnum.AbsVacDelete]}>
                              <Button
                                onClick={() => deleteAbsence()}
                                variant="text"
                                className={classes.deleteButton}
                              >
                                {t("Delete")}
                              </Button>
                            </Can>
                          )}
                          {!isCreate && dirty && !state.isClosed && (
                            <Button
                              onClick={() => {
                                // reset the form and the state
                                resetForm();
                              }}
                              variant="outlined"
                              className={classes.cancelButton}
                              disabled={!dirty}
                            >
                              {t("Discard Changes")}
                            </Button>
                          )}
                          {canSaveAbsence(values.details) && (
                            <Button
                              form="absence-form"
                              type="submit"
                              variant="contained"
                              className={classes.saveButton}
                              disabled={
                                !dirty ||
                                //negativeBalanceWarning ||
                                state.isClosed
                              }
                            >
                              {isCreate ? t("Create") : t("Save")}
                            </Button>
                          )}
                        </div>
                      </Grid>
                    </ContentFooter>
                  </>
                )}
                {step === "preAssignSub" && (
                  <AssignSub
                    orgId={organizationId}
                    actingAsEmployee={actingAsEmployee}
                    onAssignReplacement={onAssignSub}
                    onCancel={() => setStep("absence")}
                    assignmentsByDate={[]}
                    employeeName={`${employee.firstName} ${employee.lastName}`}
                    employeeId={employee.id}
                    positionId={position?.id}
                    positionName={position?.title}
                    vacancySummaryDetails={state.vacancySummaryDetailsToAssign}
                    useVacancySummaryDetails={true}
                    vacancies={state.projectedVacancies}
                  />
                )}
                {step === "confirmation" && (
                  <Confirmation
                    orgId={organizationId}
                    absence={absence}
                    setStep={setStep}
                    actingAsEmployee={actingAsEmployee}
                  />
                )}
              </form>
              {step === "edit" && (
                <EditVacancies
                  orgId={organizationId}
                  actingAsEmployee={actingAsEmployee}
                  employeeName={`${employee.firstName} ${employee.lastName}`}
                  positionName={position?.title}
                  onCancel={() => setStep("absence")}
                  details={state.projectedVacancyDetails ?? []}
                  onChangedVacancies={onChangedVacancies}
                  employeeId={employee.id}
                  setStep={setStep}
                  disabledDates={disabledDates}
                  defaultAccountingCodeAllocations={
                    values.accountingCodeAllocations
                  }
                  defaultPayCode={values.payCodeId}
                />
              )}
            </>
          );
        }}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subtitle: {
    fontSize: theme.typography.pxToRem(24),
  },
  content: {
    marginTop: theme.spacing(3),
  },
  contentFooter: {
    height: theme.typography.pxToRem(72),
    width: theme.customSpacing.contentWidth,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  unsavedText: {
    marginRight: theme.typography.pxToRem(30),
    marginTop: theme.typography.pxToRem(8),
  },
  deleteButton: {
    color: theme.customColors.darkRed,
    marginRight: theme.spacing(2),
    textDecoration: "underline",
  },
  cancelButton: {
    marginRight: theme.spacing(2),
    color: "#050039",
  },
  saveButton: {
    marginRight: theme.spacing(4),
  },
}));

const copyDetail = (
  date: Date,
  existingDetails: AbsenceDetail[]
): AbsenceDetail => {
  if (!existingDetails || existingDetails.length === 0) {
    return { date };
  }

  const firstDetail = existingDetails[0];
  return {
    ...firstDetail,
    id: undefined,
    date: date,
  };
};

const buildAbsenceInput = (
  formValues: AbsenceFormData,
  state: AbsenceState,
  disabledDates: Date[],
  forProjections: boolean
): AbsenceCreateInput | AbsenceUpdateInput | null => {
  if (
    hasIncompleteDetails(formValues.details) ||
    formValues.details.length === 0
  ) {
    return null;
  }
  const dates = getAbsenceDates(
    formValues.details.map(d => d.date),
    disabledDates
  );
  if (!dates) return null;

  let absence: AbsenceCreateInput | AbsenceUpdateInput;
  if (!state.absenceId) {
    absence = {
      orgId: state.organizationId,
      employeeId: state.employeeId,
    };
  } else {
    absence = {
      id: state.absenceId ?? "0",
      rowVersion: state.absenceRowVersion ?? "",
    };
  }

  // Add properties that span create and update
  absence = {
    ...absence,
    notesToApprover: forProjections ? undefined : formValues.notesToApprover,
    adminOnlyNotes: forProjections ? undefined : formValues.adminOnlyNotes,
    details: createAbsenceDetailInput(formValues.details),
  };

  const hasEditedDetails = !!state.customizedVacanciesInput;
  const vacancyDetails =
    state.customizedVacanciesInput ?? state.projectedVacancyDetails;

  const vDetails =
    vacancyDetails?.map(v => ({
      date: v.date,
      locationId: v.locationId,
      startTime: secondsSinceMidnight(
        parseTimeFromString(format(convertStringToDate(v.startTime)!, "h:mm a"))
      ),
      endTime: secondsSinceMidnight(
        parseTimeFromString(format(convertStringToDate(v.endTime)!, "h:mm a"))
      ),
      payCodeId: v.payCodeId ?? null,
      accountingCodeAllocations: mapAccountingCodeValueToAccountingCodeAllocations(
        v.accountingCodeAllocations,
        true
      ),
      prearrangedReplacementEmployeeId: v.assignmentEmployeeId,
    })) ?? undefined;

  // Populate the Vacancies on the Absence
  absence = {
    ...absence,
    /* TODO: When we support multi Position Employees we'll need to account for the following:
          When creating an Absence, there must be 1 Vacancy created here per Position Id.
      */
    vacancies: [
      {
        positionId: state.positionId,
        useSuppliedDetails: hasEditedDetails && vDetails && vDetails.length > 0,
        needsReplacement: formValues.needsReplacement,
        notesToReplacement: forProjections
          ? undefined
          : formValues.notesToReplacement,
        details: vDetails,
        accountingCodeAllocations:
          hasEditedDetails || !formValues.accountingCodeAllocations
            ? undefined
            : mapAccountingCodeValueToAccountingCodeAllocations(
                formValues.accountingCodeAllocations,
                true
              ),
        payCodeId:
          hasEditedDetails || !formValues.payCodeId
            ? undefined
            : formValues.payCodeId,
      },
    ],
  };
  return absence;
};

const createAbsenceDetailInput = (
  details: AbsenceDetail[]
): AbsenceDetailCreateInput[] => {
  return details.map(d => {
    let detail: AbsenceDetailCreateInput = {
      date: format(d.date, "P"),
      dayPartId: d.dayPart,
      reasons: [{ absenceReasonId: d.absenceReasonId }],
    };

    if (d.dayPart === DayPart.Hourly) {
      detail = {
        ...detail,
        startTime: secondsSinceMidnight(
          parseTimeFromString(format(d.hourlyStartTime!, "h:mm a"))
        ),
        endTime: secondsSinceMidnight(
          parseTimeFromString(format(d.hourlyEndTime!, "h:mm a"))
        ),
      };
    }

    return detail;
  });
};

const hasIncompleteDetails = (details: AbsenceDetail[]): boolean => {
  const incompleteDetail = details.find(
    d =>
      !d.absenceReasonId ||
      !d.dayPart ||
      (d.dayPart === DayPart.Hourly &&
        (!d.hourlyStartTime ||
          !d.hourlyEndTime ||
          isBefore(d.hourlyEndTime, d.hourlyStartTime)))
  );
  return !!incompleteDetail;
};
