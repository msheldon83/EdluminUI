import * as React from "react";
import {
  AccountingCodeValue,
  noAllocation,
} from "ui/components/form/accounting-code-dropdown";
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
  allAccountingCodeValuesAreEqual,
} from "helpers/accounting-code-allocations";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { Section } from "ui/components/section";
import { makeStyles, Grid, Typography, Button } from "@material-ui/core";
import { AbsenceDetails } from "./absence-details";
import {
  isSameDay,
  format,
  isBefore,
  startOfDay,
  min,
  parseISO,
} from "date-fns";
import { SubstituteDetails } from "./substitute-details";
import { ContentFooter } from "ui/components/content-footer";
import { Can, useCanDo } from "ui/components/auth/can";
import {
  getAbsenceDates,
  getCannotCreateAbsenceDates,
  payCodeIdsAreTheSame,
} from "ui/components/absence/helpers";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { some, compact, uniq } from "lodash-es";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canEditAbsVac } from "helpers/permissions";
import { AssignSub } from "ui/components/assign-sub";
import { EditVacancies } from "ui/pages/create-absence/edit-vacancies";
import { VacancyDetail } from "ui/components/absence/types";
import { convertStringToDate } from "helpers/date";
import { Confirmation } from "../create/confirmation";
import { ApolloError } from "apollo-client";
import { ErrorDialog } from "ui/components/error-dialog";
import { ApprovalState } from "ui/components/absence-vacancy/approval-state/state-banner";
import { Prompt, useRouteMatch } from "react-router";

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
    defaultAccountingCodeAllocations?: AccountingCodeValue;
  };
  initialAbsenceFormData: AbsenceFormData;
  initialAbsenceState: () => AbsenceState;
  saveAbsence: (
    data: AbsenceCreateInput | AbsenceUpdateInput
  ) => Promise<Absence>;
  saveErrorsInfo: { error: ApolloError | null; confirmed: boolean } | undefined;
  onErrorsConfirmed: () => void;
  deleteAbsence?: () => void;
  refetchAbsence?: () => Promise<void>;
};

export const AbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const canDoFn = useCanDo();
  const match = useRouteMatch();
  const [step, setStep] = useQueryParamIso(StepParams);
  const {
    actingAsEmployee,
    organizationId,
    employee,
    position,
    initialAbsenceFormData,
    initialAbsenceState,
    saveAbsence,
    deleteAbsence,
    saveErrorsInfo,
    onErrorsConfirmed,
    refetchAbsence,
  } = props;
  const [absence, setAbsence] = React.useState<Absence | undefined>();

  const [state, dispatch] = React.useReducer(
    absenceReducer,
    props,
    initialAbsenceState
  );
  const isCreate = React.useMemo(() => !state.absenceId, [state.absenceId]);

  // Ensure the User is not able to select dates that are invalid
  // for the current Employee
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
            actingAsEmployee ? "employee" : "admin",
            state.approvalState?.approvalStatusId
          )
      );
    },
    [actingAsEmployee, canDoFn, isCreate, state.approvalState?.approvalStatusId]
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

      if (isCreate) {
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
      } else {
        // TODO: When I tackle Edit, then actually cancel a live Assignment
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

      if (!detailsToAssign || detailsToAssign.length === 0) {
        setStep("absence");
        return;
      }

      if (isCreate) {
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
      } else {
        // TODO: When I tackle Edit, then actually assign a Sub on demand
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

  // Because we allow Users to change the Accounting Code and Pay Code from the Absence
  // Details view, this allows us to cascade that change down to all of the customized
  // Vacancy Details.
  const onOverallCodeChanges = React.useCallback(
    (accountingCodeValue?: AccountingCodeValue, payCodeId?: string | null) => {
      if (
        accountingCodeValue &&
        (accountingCodeValue.type !== "multiple-allocations" ||
          accountingCodeValue.allocations.filter(a => a.selection).length > 0)
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

  // Due to the way the AssignSub component is structured and it being
  // used across Absence V1, Vacancy, and now Absence V2, it expects to
  // have a list of Vacancies given to it for Absence Create/Edit so have
  // to adhere to that until we get rid of Absence V1
  const vacanciesToAssign = React.useMemo(() => {
    if (!state.projectedVacancies) {
      return undefined;
    }

    const datesToAssign = state.vacancySummaryDetailsToAssign.map(
      vsd => vsd.date
    );
    const vacanciesWithFilteredDetails = state.projectedVacancies.map(v => {
      return {
        ...v,
        details: v.details.filter(vd =>
          datesToAssign.find(d => isSameDay(d, parseISO(vd.startTimeLocal)))
        ),
      };
    });
    return vacanciesWithFilteredDetails;
  }, [state.projectedVacancies, state.vacancySummaryDetailsToAssign]);

  // Ultimately create or update the Absence
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
        initialValues={initialAbsenceFormData}
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
          accountingCodeAllocations: yup.object().test({
            name: "accountingCodeAllocationsCheck",
            test: function test(value: AccountingCodeValue) {
              const accountingCodeAllocations = mapAccountingCodeValueToAccountingCodeAllocations(
                value
              );

              const error = validateAccountingCodeAllocations(
                accountingCodeAllocations ?? [],
                t
              );
              if (!error) {
                return true;
              }

              return new yup.ValidationError(error, null, this.path);
            },
          }),
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

          return (
            <>
              <form id="absence-form" onSubmit={handleSubmit}>
                <Prompt
                  message={location => {
                    if (
                      match.url === location.pathname ||
                      (absence?.id && step === "confirmation") ||
                      !dirty
                    ) {
                      // We're not actually leaving the route
                      // OR the Absence has just been created and we're on the Confirmation screen
                      // OR we don't have any pending changes
                      return true;
                    }

                    const createPrefix = t(
                      "You have not created your absence yet."
                    );
                    const msg = t(
                      "Click DISCARD CHANGES to leave this page and lose all unsaved changes."
                    );
                    return isCreate ? `${createPrefix} ${msg}` : msg;
                  }}
                />
                {step === "absence" && (
                  <>
                    <ErrorDialog
                      open={
                        !!(saveErrorsInfo?.error && !saveErrorsInfo?.confirmed)
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
                        isCreate
                          ? t("Create absence")
                          : `${t("Edit absence")} #${state.absenceId}`
                      }
                      subHeader={
                        !actingAsEmployee
                          ? `${employee.firstName} ${employee.lastName}`
                          : undefined
                      }
                    />

                    {state.approvalState && (
                      <Can do={[PermissionEnum.AbsVacApprovalsView]}>
                        <ApprovalState
                          orgId={organizationId}
                          approvalState={state.approvalState}
                          actingAsEmployee={actingAsEmployee}
                          isTrueVacancy={false}
                          absenceId={state.absenceId}
                          onChange={refetchAbsence}
                        />
                      </Can>
                    )}

                    <Section className={classes.content}>
                      <Grid container spacing={2}>
                        <Grid item md={5}>
                          <AbsenceDetails
                            absenceId={state.absenceId}
                            organizationId={organizationId}
                            employeeId={employee.id}
                            actingAsEmployee={actingAsEmployee}
                            absenceDates={state.absenceDates}
                            onToggleAbsenceDate={d =>
                              dispatch({ action: "toggleDate", date: d })
                            }
                            closedDates={[]}
                            currentMonth={state.viewingCalendarMonth}
                            onSwitchMonth={(d: Date) =>
                              dispatch({ action: "switchMonth", month: d })
                            }
                            projectionInput={inputForProjectedCalls}
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
                            absenceId={state.absenceId}
                            organizationId={organizationId}
                            actingAsEmployee={actingAsEmployee}
                            needsReplacement={
                              position?.needsReplacement ?? NeedsReplacement.No
                            }
                            projectionInput={inputForProjectedCalls}
                            absenceDates={state.absenceDates}
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
                    vacancies={vacanciesToAssign}
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
                  onChangedVacancies={vacancyDetails => {
                    onChangedVacancies(vacancyDetails);
                    // If our Vacancy Details have changed so that they all share the same
                    // accounting code selections, then we want to reflect that in the Accounting Code
                    // dropdown shown in the Substitute Details section and we'll set that value in the form here
                    if (
                      allAccountingCodeValuesAreEqual(
                        compact(
                          vacancyDetails.map(vd => vd.accountingCodeAllocations)
                        )
                      )
                    ) {
                      setFieldValue(
                        "accountingCodeAllocations",
                        vacancyDetails[0].accountingCodeAllocations ??
                          noAllocation()
                      );
                    }
                    // Similarly, we also want to make sure the Pay Code selection shown in the Substitute Details section
                    // matches the Vacancy Details if they all have the same selection.
                    if (
                      payCodeIdsAreTheSame(
                        vacancyDetails.map(vd => vd.payCodeId)
                      )
                    ) {
                      setFieldValue("payCodeId", vacancyDetails[0].payCodeId);
                    }
                  }}
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
  if (!state.absenceId || forProjections) {
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

  // Build Vacancy Details in case we want to tell the server to use our Details
  // instead of it coming up with its own
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

  const prearrangedReplacementEmployeeIdForEntireVacancy =
    vDetails &&
    uniq(vDetails.map(vd => vd.prearrangedReplacementEmployeeId)).length === 1
      ? vDetails[0]?.prearrangedReplacementEmployeeId
      : undefined;

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
        prearrangedReplacementEmployeeId: prearrangedReplacementEmployeeIdForEntireVacancy,
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
