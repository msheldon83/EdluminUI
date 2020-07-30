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
  CancelVacancyAssignmentInput,
  ApprovalStatus,
  Assignment,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import {
  AbsenceState,
  absenceReducer,
  projectVacancyDetailsFromVacancies,
} from "../state";
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
  mapAccountingCodeAllocationsToAccountingCodeValue,
} from "helpers/accounting-code-allocations";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { Section } from "ui/components/section";
import { makeStyles, Grid, Typography, Button } from "@material-ui/core";
import { AbsenceDetails } from "./absence-details";
import {
  isSameDay,
  format,
  isAfter,
  isBefore,
  startOfDay,
  min,
  parseISO,
  isPast,
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
import {
  some,
  compact,
  flatMap,
  isNil,
  isEqual,
  differenceWith,
} from "lodash-es";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canEditAbsVac, canViewAbsVacActivityLog } from "helpers/permissions";
import { AssignSub } from "ui/components/assign-sub";
import { EditVacancies } from "ui/pages/create-absence/edit-vacancies";
import { VacancyDetail } from "ui/components/absence/types";
import { convertStringToDate } from "helpers/date";
import { Confirmation } from "../create/confirmation";
import { ApolloError } from "apollo-client";
import { ErrorDialog } from "ui/components/error-dialog";
import { ApprovalState } from "ui/components/absence-vacancy/approval-state/state-banner";
import { Prompt, useRouteMatch } from "react-router";
import { useSnackbar } from "hooks/use-snackbar";
import { useMutationBundle } from "graphql/hooks";
import { CancelAssignment } from "../graphql/cancel-assignment.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { VacancySummaryDetail } from "ui/components/absence-vacancy/vacancy-summary/types";
import { AssignVacancy } from "../graphql/assign-vacancy.gen";
import { AbsenceReasonUsageData } from "./balance-usage";
import { DiscardChangesDialog } from "ui/components/discard-changes-dialog";
import { ActionMenu, Option } from "ui/components/action-menu";
import { useHistory } from "react-router";
import { AbsenceActivityLogRoute } from "ui/routes/absence-vacancy/activity-log";
import { AbsenceVacancyNotificationLogRoute } from "ui/routes/notification-log";
import { EmployeeLink } from "ui/components/links/people";

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
  absence?: Absence;
};

export const AbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const canDoFn = useCanDo();
  const match = useRouteMatch();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
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
    absence,
  } = props;

  const [cancelDialogIsOpen, setCancelDialogIsOpen] = React.useState(false);
  const [localAbsence, setLocalAbsence] = React.useState<Absence | undefined>(
    absence
  );
  React.useEffect(() => {
    // Since there are conditions in the Edit workflow where we allow sub components
    // to refetch the Absence, it is possible for us to get an update Absence prop
    // coming into this component and we want to account for that
    setLocalAbsence(absence);
  }, [absence]);

  const [
    vacancySummaryDetailsToAssign,
    setVacancySummaryDetailsToAssign,
  ] = React.useState<VacancySummaryDetail[]>([]);

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
    state.viewingCalendarMonth,
    state.absenceDates && state.absenceDates.length > 0
      ? min(state.absenceDates)
      : undefined
  );
  const disabledDates = React.useMemo(() => {
    // There's only going to be initial details when Editing an existing
    // Absence, so for create this will just be an empty list
    const existingAbsenceDays = initialAbsenceFormData.details.map(d => d.date);

    return differenceWith(
      getCannotCreateAbsenceDates(disabledDatesObjs),
      existingAbsenceDays,
      isSameDay
    );
  }, [disabledDatesObjs, initialAbsenceFormData.details]);
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

  // When "actingAsEmployee", if any of the Absence Reasons chosen result in a negative balance warning,
  // we will prevent being able to save the balance until that warning is addressed
  // by either changing the reasons selected or the amount of the balance being used
  const [negativeBalanceWarning, setNegativeBalanceWarning] = React.useState(
    false
  );

  // If we have an existing Absence, determine what the initial Absence Reason Usage
  // is so that we can accurately determine how changes to the Absence Details would
  // affect the usage without double counting anything
  const initialAbsenceReasonUsageData = React.useMemo(() => {
    if (!localAbsence || !localAbsence.details) {
      return undefined;
    }

    const details = localAbsence.details;
    const usages = flatMap(details, (d => d?.reasonUsages) ?? []) ?? [];
    const usageData: AbsenceReasonUsageData[] = compact(
      usages.map(u => {
        if (!u || isNil(u.dailyAmount) || isNil(u.hourlyAmount)) {
          return null;
        }

        return {
          hourlyAmount: u.hourlyAmount,
          dailyAmount: u.dailyAmount,
          absenceReasonId: u.absenceReasonId,
          absenceReason: {
            absenceReasonCategoryId: u.absenceReason?.absenceReasonCategoryId,
          },
        };
      })
    );
    return usageData;
  }, [localAbsence]);

  // --- Handling of Sub pre-arrange, assignment, or removal ------
  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onCancelAssignment = React.useCallback(
    async (
      vacancyDetailIds?: string[],
      vacancyDetailDates?: Date[]
    ): Promise<boolean> => {
      // Get all of the matching assignments
      const assignments =
        vacancyDetailIds && vacancyDetailIds.length > 0
          ? (state.assignmentsByDate ?? []).filter(a =>
              vacancyDetailIds.includes(a.vacancyDetailId ?? "")
            )
          : (state.assignmentsByDate ?? []).filter(a =>
              vacancyDetailDates?.find(date =>
                isSameDay(date, a.startTimeLocal)
              )
            );

      if (!assignments || assignments.length === 0) {
        return true;
      }

      if (isCreate && !localAbsence) {
        dispatch({
          action: "updateAssignments",
          assignments: assignments,
          addRemoveOrUpdate: "remove",
        });
        return true;
      } else {
        // Get all of the Assignment Ids and Row Versions to Cancel
        const assignmentsToCancel: CancelVacancyAssignmentInput[] = assignments.reduce(
          (accumulator: CancelVacancyAssignmentInput[], assignment) => {
            const matchingAssignment = accumulator.find(
              a => a.assignmentId === assignment.assignmentId
            );
            if (matchingAssignment) {
              matchingAssignment.vacancyDetailIds?.push(
                assignment.vacancyDetailId!
              );
            } else {
              accumulator.push({
                assignmentId: assignment.assignmentId ?? "",
                rowVersion: assignment.assignmentRowVersion ?? "",
                vacancyDetailIds: [assignment.vacancyDetailId!],
              });
            }
            return accumulator;
          },
          []
        );

        let assignmentsByDate = [...(state.assignmentsByDate ?? [])];
        let allCancellationsSuccessful = true;
        for (let index = 0; index < assignmentsToCancel.length; index++) {
          const toCancel = assignmentsToCancel[index];
          const result = await cancelAssignment({
            variables: {
              assignment: toCancel,
            },
          });
          if (result?.data) {
            // Possible we just cancelled part of an assignment
            // which would result in a new RowVersion for that assignment object
            assignmentsByDate.forEach(a => {
              if (
                a.assignmentId &&
                a.assignmentId ===
                  result?.data?.assignment?.cancelAssignment?.id
              ) {
                a.assignmentRowVersion =
                  result.data?.assignment?.cancelAssignment?.rowVersion;
              }
            });

            if (toCancel.vacancyDetailIds) {
              // Remove any assignments whose vacancyDetailId was included
              assignmentsByDate = assignmentsByDate.filter(
                a =>
                  a.vacancyDetailId &&
                  !toCancel.vacancyDetailIds?.includes(a.vacancyDetailId)
              );
            }
          } else {
            allCancellationsSuccessful = false;
          }
        }

        // Update the assignment info stored in state
        dispatch({
          action: "updateAssignments",
          assignments: assignmentsByDate,
          addRemoveOrUpdate: "update",
        });
        console.log(assignmentsByDate);
        return allCancellationsSuccessful;
      }
    },
    [localAbsence, cancelAssignment, isCreate, state.assignmentsByDate]
  );

  const [assignVacancy] = useMutationBundle(AssignVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

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
        state.customizedVacanciesInput ??
        state.projectedVacancyDetails ??
        state.initialVacancyDetails;

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
          addRemoveOrUpdate: "add",
        });
      } else {
        // Cancel any existing assignments on these Details
        await onCancelAssignment(vacancyDetailIds);
        // Create an Assignment for these Details
        const result = await assignVacancy({
          variables: {
            assignment: {
              orgId: organizationId,
              vacancyId: state.vacancyId ?? "",
              employeeId: replacementEmployeeId,
              vacancyDetailIds: compact(
                detailsToAssign.map(d => d.vacancyDetailId)
              ),
            },
          },
        });
        const assignment = result?.data?.vacancy?.assignVacancy as Assignment;
        if (assignment) {
          // Update the assignments information in state
          dispatch({
            action: "updateAssignments",
            assignments: detailsToAssign.map(d => {
              return {
                startTimeLocal: parseISO(d.startTime),
                vacancyDetailId: d.vacancyDetailId,
                assignmentId: assignment.id,
                assignmentRowVersion: assignment.rowVersion,
                employee: {
                  id: replacementEmployeeId,
                  firstName: replacementEmployeeFirstName,
                  lastName: replacementEmployeeLastName,
                },
              };
            }),
            addRemoveOrUpdate: "add",
          });
        }
      }

      setStep("absence");
    },
    [
      assignVacancy,
      isCreate,
      onCancelAssignment,
      organizationId,
      setStep,
      state.customizedVacanciesInput,
      state.initialVacancyDetails,
      state.projectedVacancyDetails,
      state.vacancyId,
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

    const datesToAssign = vacancySummaryDetailsToAssign.map(vsd => vsd.date);
    const vacanciesWithFilteredDetails = state.projectedVacancies.map(v => {
      return {
        ...v,
        details: v.details.filter(vd =>
          datesToAssign.find(d => isSameDay(d, parseISO(vd.startTimeLocal)))
        ),
      };
    });
    return vacanciesWithFilteredDetails;
  }, [state.projectedVacancies, vacancySummaryDetailsToAssign]);

  // Ultimately create or update the Absence
  const save = React.useCallback(
    async (
      formValues: AbsenceFormData,
      ignoreWarnings?: boolean
    ): Promise<AbsenceFormData | undefined> => {
      const vacancyDetails =
        state.customizedVacanciesInput ??
        state.projectedVacancyDetails ??
        state.initialVacancyDetails;

      let absenceInput = buildAbsenceInput(
        formValues,
        state,
        vacancyDetails ?? [],
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

      const updatedAbsence = await saveAbsence(absenceInput);
      if (!updatedAbsence) {
        return;
      }

      setLocalAbsence(updatedAbsence);
      dispatch({ action: "resetAfterSave", updatedAbsence });
      if (isCreate) {
        // We need to get the Assignment Id and Row Version from
        // the newly created Absence info in order to allow the User
        // to cancel any Assignments
        const assignments = compact(
          flatMap(
            updatedAbsence.vacancies?.map(v =>
              v?.details?.map(vd => {
                if (!vd.assignment) {
                  return null;
                }

                return {
                  detail: vd,
                  assignment: vd.assignment,
                };
              })
            )
          )
        );

        dispatch({
          action: "updateAssignments",
          assignments: assignments.map(a => {
            return {
              assignmentId: a.assignment.id,
              assignmentRowVersion: a.assignment.rowVersion,
              startTimeLocal: parseISO(a.detail.startTimeLocal),
              vacancyDetailId: a.detail.id,
              employee: {
                id: a.assignment.employeeId,
                firstName: a.assignment.employee?.firstName ?? "",
                lastName: a.assignment.employee?.lastName ?? "",
              },
            };
          }),
          addRemoveOrUpdate: "update",
        });

        // Show the User the confirmation screen
        setStep("confirmation");
      } else {
        openSnackbar({
          message: t("The absence has been updated"),
          dismissable: true,
          status: "success",
          autoHideDuration: 5000,
        });
      }

      // When editing an Absence, this will provide us with a
      // fresh version of the form data that we can reset the form with
      return buildFormData(updatedAbsence);
    },
    [disabledDates, isCreate, openSnackbar, saveAbsence, setStep, state, t]
  );

  const actionMenuOptions = React.useMemo(() => {
    const options: Option[] = [
      {
        name: t("Activity Log"),
        onClick: () => {
          history.push(
            AbsenceActivityLogRoute.generate({
              organizationId: organizationId,
              absenceId: localAbsence?.id ?? "",
            })
          );
        },
        permissions: (
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string
        ) =>
          canViewAbsVacActivityLog(
            permissions,
            isSysAdmin,
            !actingAsEmployee,
            orgId
          ),
      },
    ];
    const vacancies = compact(localAbsence?.vacancies ?? []);
    if (vacancies.length > 0) {
      options.push({
        name: t("Notification Log"),
        onClick: () => {
          history.push(
            AbsenceVacancyNotificationLogRoute.generate({
              organizationId: organizationId,
              vacancyId: state.vacancyId ?? "",
            })
          );
        },
        permissions: [PermissionEnum.AbsVacViewNotificationLog],
      });
    }
    return options;
  }, [
    actingAsEmployee,
    history,
    localAbsence?.id,
    localAbsence?.vacancies,
    organizationId,
    state.vacancyId,
    t,
  ]);

  const allVacancyDetails = localAbsence?.vacancies
    ? flatMap(compact(localAbsence.vacancies), v => compact(v.details))
    : [];
  const hasFilledVacancies = allVacancyDetails.some(d => d.isFilled);
  const hasVerifiedAssignments = allVacancyDetails.some(d => d.verifiedAtUtc);

  const canDeleteAbsence =
    actingAsEmployee && localAbsence
      ? isAfter(parseISO(localAbsence.startTimeLocal), new Date()) &&
        !hasFilledVacancies &&
        localAbsence.approvalStatus !== ApprovalStatus.PartiallyApproved &&
        localAbsence.approvalStatus !== ApprovalStatus.Approved &&
        !hasVerifiedAssignments
      : true;

  const canEditDatesAndTimes =
    !state.isClosed &&
    (isCreate ||
      !actingAsEmployee ||
      (!hasFilledVacancies && !some(state.absenceDates, isPast)));

  return (
    <>
      <PageTitle
        title={isCreate ? t("Create absence") : t("Edit absence")}
        withoutHeading
      />
      <Formik
        initialValues={initialAbsenceFormData}
        enableReinitialize={true}
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
          const formData = await save(data);
          if (formData) {
            e.resetForm({
              values: formData,
            });
          }
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
          const unsavedAbsenceDetailChanges =
            !isEqual(initialAbsenceFormData.details, values.details) ||
            initialAbsenceFormData.needsReplacement !== values.needsReplacement;
          console.log(
            "unsavedAbsenceDetailChanges",
            unsavedAbsenceDetailChanges
          );

          const vacancyDetails =
            state.customizedVacanciesInput ||
            ((unsavedAbsenceDetailChanges || isCreate) &&
              state.projectedVacancyDetails) ||
            state.initialVacancyDetails;
          console.log("vacancyDetails", vacancyDetails);

          const formIsDirty =
            dirty || !isEqual(state.initialVacancyDetails, vacancyDetails);

          const inputForProjectedCalls = buildAbsenceInput(
            values,
            state,
            vacancyDetails ?? [],
            disabledDates,
            true
          ) as AbsenceCreateInput;

          return (
            <>
              <form id="absence-form" onSubmit={handleSubmit}>
                <DiscardChangesDialog
                  onCancel={() => {
                    resetForm();
                    dispatch({
                      action: "resetToInitialState",
                      initialState: initialAbsenceState(),
                    });
                    setCancelDialogIsOpen(false);
                  }}
                  onClose={() => setCancelDialogIsOpen(false)}
                  open={cancelDialogIsOpen}
                />
                <Prompt
                  message={location => {
                    if (
                      match.url === location.pathname ||
                      (localAbsence?.id && step === "confirmation") ||
                      !formIsDirty ||
                      state.isClosed
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
                      continueAction={async () => {
                        const formData = await save(values, true);
                        if (formData) {
                          resetForm({
                            values: formData,
                          });
                        }
                      }}
                    />
                    <div className={classes.titleContainer}>
                      <AbsenceVacancyHeader
                        pageHeader={
                          isCreate
                            ? t("Create absence")
                            : `${t("Edit absence")} #${state.absenceId}`
                        }
                        subHeader={
                          !actingAsEmployee ? (
                            <EmployeeLink
                              orgUserId={employee?.id ?? ""}
                              color="black"
                            >
                              {`${employee.firstName} ${employee.lastName}`}
                            </EmployeeLink>
                          ) : (
                            undefined
                          )
                        }
                      />
                      {!isCreate && (
                        <div className={classes.headerMenu}>
                          <ActionMenu
                            className={classes.actionMenu}
                            options={actionMenuOptions}
                          />
                        </div>
                      )}
                    </div>

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
                            closedDates={state.closedDates}
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
                            setNegativeBalanceWarning={
                              setNegativeBalanceWarning
                            }
                            initialUsageData={initialAbsenceReasonUsageData}
                            canEditReason={!state.isClosed}
                            canEditDatesAndTimes={canEditDatesAndTimes}
                            isClosed={state.isClosed ?? false}
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
                              console.log(vacancySummaryDetailsToAssign);
                              setVacancySummaryDetailsToAssign(
                                vacancySummaryDetailsToAssign
                              );
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
                            disableReplacementInteractions={
                              !isCreate && unsavedAbsenceDetailChanges
                            }
                            vacanciesOverride={
                              unsavedAbsenceDetailChanges || isCreate
                                ? undefined
                                : compact(localAbsence?.vacancies)
                            }
                            canEditSubDetails={canEditDatesAndTimes}
                            isClosed={state.isClosed ?? false}
                          />
                        </Grid>
                      </Grid>
                    </Section>
                    <ContentFooter>
                      <Grid item xs={12} className={classes.contentFooter}>
                        <div className={classes.actionButtons}>
                          <div className={classes.unsavedText}>
                            {(formIsDirty || isCreate) && !state.isClosed && (
                              <Typography>
                                {t("This page has unsaved changes")}
                              </Typography>
                            )}
                          </div>
                          {deleteAbsence && canDeleteAbsence && !formIsDirty && (
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
                          {!isCreate && formIsDirty && !state.isClosed && (
                            <Button
                              onClick={() => setCancelDialogIsOpen(true)}
                              variant="outlined"
                              className={classes.cancelButton}
                              disabled={!formIsDirty}
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
                                !formIsDirty ||
                                isSubmitting ||
                                negativeBalanceWarning ||
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
                    vacancySummaryDetails={vacancySummaryDetailsToAssign}
                    useVacancySummaryDetails={true}
                    existingVacancy={!!state.vacancyId}
                    selectButtonText={!isCreate ? t("Assign") : undefined}
                    vacancies={!state.vacancyId ? vacanciesToAssign : undefined}
                    vacancyId={state.vacancyId}
                    vacancyDetailIdsToAssign={
                      state.vacancyId
                        ? compact(
                            vacancySummaryDetailsToAssign.map(
                              v => v.vacancyDetailId
                            )
                          )
                        : undefined
                    }
                  />
                )}
                {step === "confirmation" && (
                  <Confirmation
                    orgId={organizationId}
                    absence={localAbsence}
                    setStep={setStep}
                    actingAsEmployee={actingAsEmployee}
                    onCancelAssignment={onCancelAssignment}
                    resetForm={() => {
                      // Really important for when an Employee has created an Absence and then clicks
                      // Create New from the Confirmation screen. Their initial form data doesn't change
                      // so we want to make sure everything is set back to an initial state for the
                      // next Absence to be created
                      resetForm();
                      dispatch({
                        action: "resetToInitialState",
                        initialState: initialAbsenceState(),
                      });
                    }}
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
                  details={
                    state.projectedVacancyDetails ??
                    state.initialVacancyDetails ??
                    []
                  }
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
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignText: "center",
    justifyContent: "space-between",
  },
  headerMenu: {
    marginTop: "30px",
    display: "flex",
    flexDirection: "column",
    alignText: "center",
    justifyContent: "space-between",
  },
  actionMenu: {
    display: "flex",
    justifyContent: "flex-end",
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

const buildAbsenceInput = (
  formValues: AbsenceFormData,
  state: AbsenceState,
  vacancyDetails: VacancyDetail[],
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
    details: createAbsenceDetailInput(formValues.details, forProjections),
  };

  const hasEditedDetails = !!state.customizedVacanciesInput;

  // Build Vacancy Details in case we want to tell the server to use our Details
  // instead of it coming up with its own
  const vDetails = vacancyDetails?.map(v => {
    // If creating, look to see if we're trying to prearrange anyone for this detail
    const assignment = !state.absenceId
      ? state.assignmentsByDate?.find(
          a =>
            (v.vacancyDetailId && a.vacancyDetailId === v.vacancyDetailId) ||
            (!v.vacancyDetailId &&
              isSameDay(a.startTimeLocal, startOfDay(parseISO(v.date))))
        )
      : undefined;

    return (
      {
        date: v.date,
        locationId: v.locationId,
        startTime: secondsSinceMidnight(
          parseTimeFromString(
            format(convertStringToDate(v.startTime)!, "h:mm a")
          )
        ),
        endTime: secondsSinceMidnight(
          parseTimeFromString(format(convertStringToDate(v.endTime)!, "h:mm a"))
        ),
        payCodeId: !hasEditedDetails ? undefined : v.payCodeId ?? null,
        accountingCodeAllocations: !hasEditedDetails
          ? undefined
          : mapAccountingCodeValueToAccountingCodeAllocations(
              v.accountingCodeAllocations,
              true
            ),
        prearrangedReplacementEmployeeId: assignment?.employee?.id,
      } ?? undefined
    );
  });

  // Populate the Vacancies on the Absence
  absence = {
    ...absence,
    /* TODO: When we support multi Position Employees we'll need to account for the following:
          When creating an Absence, there must be 1 Vacancy created here per Position Id.
      */
    vacancies: [
      {
        positionId: state.positionId ?? undefined,
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
  details: AbsenceDetail[],
  forProjections: boolean
): AbsenceDetailCreateInput[] => {
  return details.map(d => {
    let detail: AbsenceDetailCreateInput = {
      id: forProjections ? undefined : d.id,
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

export const buildFormData = (absence: Absence): AbsenceFormData => {
  // Figure out the details to put into the form
  const details = compact(absence?.details);
  const closedDetails = compact(absence?.closedDetails);
  const detailsToUse = details.length === 0 ? closedDetails : details;
  const formDetails = compact(detailsToUse).map(d => {
    return {
      id: d.id,
      date: startOfDay(parseISO(d.startDate)),
      dayPart: d.dayPartId ?? undefined,
      hourlyStartTime:
        d.dayPartId === DayPart.Hourly ? parseISO(d.startTimeLocal) : undefined,
      hourlyEndTime:
        d.dayPartId === DayPart.Hourly ? parseISO(d.endTimeLocal) : undefined,
      absenceReasonId: d.reasonUsages
        ? d.reasonUsages[0]?.absenceReasonId
        : undefined,
    };
  });

  const vacancies = compact(absence?.vacancies ?? []);
  const vacancy = vacancies[0];

  // Figure out the overall accounting code allocations
  // that would display on the Absence Details view
  const accountingCodeAllocations = compact(
    vacancy?.details
  )[0]?.accountingCodeAllocations?.map(a => {
    return {
      accountingCodeId: a.accountingCodeId,
      accountingCodeName: a.accountingCode?.name,
      allocation: a.allocation,
    };
  });

  // Figure out if the form needs to enforce
  // Notes To Approver being required
  const allReasons = compact(
    flatMap((absence?.details ?? []).map(d => d?.reasonUsages))
  );
  const notesToApproverRequired = allReasons.find(
    a => a.absenceReason?.requireNotesToAdmin
  );

  return {
    details: formDetails,
    notesToApprover: absence?.notesToApprover ?? "",
    adminOnlyNotes: absence?.adminOnlyNotes ?? "",
    needsReplacement: !!vacancy,
    notesToReplacement: vacancy?.notesToReplacement ?? "",
    requireNotesToApprover: !!notesToApproverRequired,
    payCodeId: vacancy?.details
      ? vacancy?.details[0]?.payCodeId ?? undefined
      : undefined,
    accountingCodeAllocations: vacancy?.details
      ? mapAccountingCodeAllocationsToAccountingCodeValue(
          accountingCodeAllocations ?? undefined
        )
      : undefined,
    sameReasonForAllDetails: detailsHaveTheSameReasons(formDetails),
    sameTimesForAllDetails: detailsHaveTheSameTimes(formDetails)
  };
};

const detailsHaveTheSameReasons = (details: AbsenceDetail[]) => {
  if (!details || details.length === 0) {
    return true;
  }

  const absenceReasonIdToCompare = details[0].absenceReasonId;
  for (let index = 0; index < details.length; index++) {
    const absenceReasonId = details[index].absenceReasonId;
    if (!absenceReasonId && !absenceReasonIdToCompare) {
      continue;
    }

    if (absenceReasonId !== absenceReasonIdToCompare) {
      return false;
    }
  }

  return true;
};

const detailsHaveTheSameTimes = (details: AbsenceDetail[]) => {
  if (!details || details.length === 0) {
    return true;
  }

  const timesToCompare = {
    dayPart: details[0].dayPart,
    hourlyStartTime: details[0].hourlyStartTime,
    hourlyEndTime: details[0].hourlyEndTime,
  };
  for (let index = 0; index < details.length; index++) {
    const times = {
      dayPart: details[index].dayPart,
      hourlyStartTime: details[index].hourlyStartTime,
      hourlyEndTime: details[index].hourlyEndTime,
    };
    if (!times?.dayPart && !timesToCompare?.dayPart) {
      continue;
    }

    if (times.dayPart !== timesToCompare.dayPart) {
      return false;
    }

    // If Hourly, check if the start and end are the same
    if (
      times.dayPart === DayPart.Hourly &&
      (times.hourlyStartTime?.toISOString() !==
        timesToCompare.hourlyStartTime?.toISOString() ||
        times.hourlyEndTime?.toISOString() !==
          timesToCompare.hourlyEndTime?.toISOString())
    ) {
      return false;
    }
  }

  return true;
};
