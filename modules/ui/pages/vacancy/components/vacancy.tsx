import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Button } from "@material-ui/core";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useState, useMemo, useEffect } from "react";
import { useRouteParams } from "ui/routes/definition";
import {
  PermissionEnum,
  Assignment,
  CancelVacancyAssignmentInput,
  ApprovalStatus,
  Maybe,
} from "graphql/server-types.gen";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/graphql/position-types.gen";
import { GetAllLocationsWithSchedulesWithinOrg } from "../graphql/get-locations-with-schedules.gen";
import { GetAllContracts } from "reference-data/get-contracts.gen";
import { GetAllPayCodesWithinOrg } from "ui/pages/pay-code/graphql/get-pay-codes.gen";
import { GetAccountingCodes } from "reference-data/get-accounting-codes.gen";
import { VacancyCreateRoute } from "ui/routes/vacancy";
import { useQueryParamIso } from "hooks/query-params";
import { VacancyStepParams } from "helpers/step-params";
import { Formik } from "formik";
import { VacancyDetailSection } from "./vacancy-details-section";
import { ContentFooter } from "ui/components/content-footer";
import { Can } from "ui/components/auth/can";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canEditAbsVac, canAssignSub } from "helpers/permissions";
import { parseISO, isSameDay, format, startOfDay, min } from "date-fns";
import { AssignSub } from "ui/components/assign-sub";
import { VacancyConfirmation } from "./vacancy-confirmation";
import { compact, isEqual } from "lodash-es";
import { ExecutionResult } from "graphql";
import { Prompt, useRouteMatch } from "react-router";
import { buildVacancyCreateInput } from "../helpers";
import { AssignVacancy } from "../graphql/assign-vacancy.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { CancelAssignment } from "../graphql/cancel-assignment.gen";
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary";
import { CreateVacancyMutation } from "../graphql/create-vacancy.gen";
import { UpdateVacancyMutation } from "../graphql/update-vacancy.gen";
import { convertVacancyDetailsFormDataToVacancySummaryDetails } from "ui/components/absence-vacancy/vacancy-summary/helpers";
import { VacancySummaryDetail } from "ui/components/absence-vacancy/vacancy-summary/types";
import {
  VacancyDetailsFormData,
  VacancyFormValues,
  VacancyDetailItem,
} from "../helpers/types";
import { ApprovalState } from "ui/components/absence-vacancy/approval-state/state-banner";
import { ApprovalWorkflowSteps } from "ui/components/absence-vacancy/approval-state/types";
import * as yup from "yup";
import { validateAccountingCodeAllocations } from "helpers/accounting-code-allocations";
import { FilteredAssignmentButton } from "ui/components/absence-vacancy/vacancy-summary/filtered-assignment-button";
import { GetProjectedIsApprovedForSubJobSearch } from "../graphql/get-projected-isapprovedforsubjobsearch.gen";

type Props = {
  initialVacancy: VacancyDetailsFormData;
  createVacancy?: (
    v: VacancyDetailsFormData
  ) => Promise<ExecutionResult<CreateVacancyMutation>>;
  updateVacancy?: (
    v: VacancyDetailsFormData
  ) => Promise<ExecutionResult<UpdateVacancyMutation>>;
  onDelete?: () => void;
  approvalState?: {
    id: string;
    canApprove: boolean;
    approvalWorkflowId: string;
    approvalWorkflow: {
      steps: ApprovalWorkflowSteps[];
    };
    approvalStatusId: ApprovalStatus;
    deniedApproverGroupHeaderName?: string | null;
    approvedApproverGroupHeaderNames?: Maybe<string>[] | null;
    pendingApproverGroupHeaderName?: string | null;
    comments: {
      commentIsPublic: boolean;
    }[];
  } | null;
  refetchVacancy?: () => Promise<unknown>;
  isApprovedForSubJobSearch?: boolean;
};

export const VacancyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(VacancyCreateRoute);
  const [step, setStep] = useQueryParamIso(VacancyStepParams);
  const { openSnackbar } = useSnackbar();
  const match = useRouteMatch();
  const {
    initialVacancy,
    createVacancy,
    updateVacancy,
    onDelete,
    approvalState,
  } = props;
  const [resetKey, setResetKey] = useState(0);

  const [vacancy, setVacancy] = useState<VacancyDetailsFormData>({
    ...initialVacancy,
  });

  const resetVacancy = () => {
    setResetKey(resetKey + 1);
    setVacancy({ ...initialVacancy });
    setStep("vacancy");
  };

  const [initialFormValues, setInitialFormValues] = useState<VacancyFormValues>(
    {
      id: vacancy.id,
      positionTypeId: vacancy.positionTypeId,
      title: vacancy.title,
      locationId: vacancy.locationId,
      locationName: vacancy.locationName,
      contractId: vacancy.contractId,
      workDayScheduleId: vacancy.workDayScheduleId,
      details: vacancy.details,
      notesToReplacement: vacancy.notesToReplacement,
      adminOnlyNotes: vacancy.adminOnlyNotes,
    }
  );

  useEffect(() => {
    if (initialVacancy.id && initialVacancy.id !== vacancy.id) {
      setVacancy({ ...initialVacancy });
    }
  }, [initialVacancy, vacancy.id]);

  useEffect(() => {
    if (initialFormValues.id && initialFormValues.id !== vacancy.id) {
      setInitialFormValues({
        id: vacancy.id,
        positionTypeId: vacancy.positionTypeId,
        title: vacancy.title,
        locationId: vacancy.locationId,
        locationName: vacancy.locationName,
        contractId: vacancy.contractId,
        workDayScheduleId: vacancy.workDayScheduleId,
        details: vacancy.details,
        notesToReplacement: vacancy.notesToReplacement,
        adminOnlyNotes: vacancy.adminOnlyNotes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vacancy.id]);

  const vacancyExists = useMemo(() => {
    return vacancy.id ? true : false;
  }, [vacancy]);

  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: {
      orgId: params.organizationId,
      includeExpired: false,
      forStaffAugmentation: true,
    },
  });

  const getLocations = useQueryBundle(GetAllLocationsWithSchedulesWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  const getPayCodes = useQueryBundle(GetAllPayCodesWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  const getContracts = useQueryBundle(GetAllContracts, {
    variables: { orgId: params.organizationId },
  });

  const getAccountingCodes = useQueryBundle(GetAccountingCodes, {
    variables: { orgId: params.organizationId },
  });

  const [assignVacancy] = useMutationBundle(AssignVacancy, {
    refetchQueries: ["GetVacancyById"],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    refetchQueries: ["GetVacancyById"],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const disableAssign: boolean = useMemo(() => {
    if (
      vacancy &&
      vacancy.positionTypeId &&
      vacancy.locationId &&
      vacancy.contractId &&
      vacancy.details &&
      vacancy.details.length > 0
    ) {
      return false;
    } else {
      return true;
    }
  }, [vacancy]);

  const isUnfilled: boolean = useMemo(() => {
    return !vacancy.details.find(d => !!d.assignment);
  }, [vacancy]);

  const showAssign: boolean = useMemo(() => {
    return isUnfilled;
  }, [isUnfilled]);

  const showSubmit: boolean = useMemo(() => {
    if (
      vacancy &&
      !vacancy.id &&
      vacancy.positionTypeId &&
      vacancy.locationId &&
      vacancy.contractId &&
      vacancy.details.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }, [vacancy]);

  const [
    vacancySummaryDetailsToAssign,
    setVacancySummaryDetailsToAssign,
  ] = React.useState<VacancySummaryDetail[] | undefined>(undefined);

  const initialReasonIds = [
    ...new Set(initialFormValues.details.map(x => x.vacancyReasonId)),
  ];
  const updatedReasonIds = [
    ...new Set(vacancy.details.map(x => x.vacancyReasonId)),
  ];
  const differentReasonIds = updatedReasonIds.filter(
    x => !initialReasonIds.includes(x)
  );

  const skipProjectedIsAvailableForSubJobSearch =
    initialFormValues.positionTypeId === vacancy.positionTypeId ||
    differentReasonIds.length === 0
      ? true
      : false;

  const getProjectedIsAvailableForSubJobSearch = useQueryBundle(
    GetProjectedIsApprovedForSubJobSearch,
    {
      variables: {
        vacancy: buildVacancyCreateInput(vacancy),
      },
      skip: skipProjectedIsAvailableForSubJobSearch,
    }
  );

  const isApprovedForSubJobSearch = useMemo(() => {
    const projectedIsAvailableForSubJobSearch =
      getProjectedIsAvailableForSubJobSearch.state !== "LOADING" &&
      getProjectedIsAvailableForSubJobSearch.state !== "UPDATING"
        ? getProjectedIsAvailableForSubJobSearch.data.vacancy
            ?.projectIsApprovedForSubJobSearch
        : undefined;

    if (
      projectedIsAvailableForSubJobSearch !== null &&
      projectedIsAvailableForSubJobSearch !== undefined
    ) {
      return projectedIsAvailableForSubJobSearch;
    } else {
      return props.isApprovedForSubJobSearch !== undefined
        ? props.isApprovedForSubJobSearch
        : true;
    }
  }, [getProjectedIsAvailableForSubJobSearch, props.isApprovedForSubJobSearch]);

  const onAssignSub = React.useCallback(
    async (
      replacementEmployee: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string | null | undefined;
      },
      payCode: string | undefined,
      vacancyDetailIds?: string[],
      vacancySummaryDetails?: VacancySummaryDetail[]
    ) => {
      // Get all of the matching details
      const detailsToAssign = vacancySummaryDetails
        ? vacancy.details.filter(d =>
            vacancySummaryDetails.find(vsd => vsd.vacancyDetailId === d.id)
          )
        : vacancy.details;

      if (vacancy.id) {
        // Cancel any existing assignments on these Details
        if (vacancySummaryDetails) {
          await onCancelAssignment(vacancySummaryDetails);
        }

        // Create an Assignment for these Details
        const result = await assignVacancy({
          variables: {
            assignment: {
              orgId: params.organizationId,
              vacancyId: vacancy.id,
              employeeId: replacementEmployee.id,
              vacancyDetailIds: detailsToAssign.map(d => d.id!),
            },
          },
        });
        const assignment = result?.data?.vacancy?.assignVacancy as Assignment;
        if (assignment) {
          setVacancy({
            ...vacancy,
            details: vacancy.details.map(d => {
              if (!vacancyDetailIds?.find(i => d.id === i)) {
                return d;
              }

              return {
                ...d,
                assignment: {
                  id: assignment.id,
                  rowVersion: assignment.rowVersion,
                  employee: {
                    id: replacementEmployee.id,
                    firstName: replacementEmployee.firstName,
                    lastName: replacementEmployee.lastName,
                    email: replacementEmployee.email ?? undefined,
                  },
                },
              };
            }),
          });
        }
      } else {
        setVacancy({
          ...vacancy,
          details: vacancy.details.map(d => {
            if (!detailsToAssign?.find(a => d.id === a.id)) {
              return d;
            }

            return {
              ...d,
              assignment: {
                employee: {
                  id: replacementEmployee.id,
                  firstName: replacementEmployee.firstName,
                  lastName: replacementEmployee.lastName,
                  email: replacementEmployee.email ?? undefined,
                },
              },
            };
          }),
        });
      }

      setStep("vacancy");
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [setStep, vacancy]
  );

  const onCancelAssignment = React.useCallback(
    async (vacancySummaryDetails: VacancySummaryDetail[]): Promise<boolean> => {
      // Get all of the matching details
      const detailsToCancelAssignmentsFor = vacancySummaryDetails
        ? vacancy.details.filter(
            d =>
              d.assignment &&
              !!vacancySummaryDetails.find(vsd => vsd.vacancyDetailId === d.id)
          )
        : vacancy.details.filter(d => d.assignment);

      const updatedDetails = [...vacancy.details];
      const localDetailIdsToClearAssignmentsOn: string[] = [];
      let allCancellationsSuccessful = true;
      if (vacancy.id) {
        // Get all of the Assignment Ids and Row Versions to Cancel
        const assignmentsToCancel: CancelVacancyAssignmentInput[] = detailsToCancelAssignmentsFor.reduce(
          (accumulator: CancelVacancyAssignmentInput[], detail) => {
            const matchingAssignment = accumulator.find(
              a => a.assignmentId === detail.assignment?.id
            );
            if (matchingAssignment) {
              matchingAssignment.vacancyDetailIds?.push(detail.id!);
            } else {
              accumulator.push({
                assignmentId: detail.assignment?.id ?? "",
                rowVersion: detail.assignment?.rowVersion ?? "",
                vacancyDetailIds: [detail.id!],
              });
            }
            return accumulator;
          },
          []
        );

        for (let index = 0; index < assignmentsToCancel.length; index++) {
          const a = assignmentsToCancel[index];
          const result = await cancelAssignment({
            variables: {
              assignment: a,
            },
          });
          if (result?.data) {
            if (a.vacancyDetailIds) {
              localDetailIdsToClearAssignmentsOn.push(...a.vacancyDetailIds);
            }
            updatedDetails
              .filter(
                d =>
                  d.assignment?.id &&
                  d.assignment?.id ===
                    result?.data?.assignment?.cancelAssignment?.id
              )
              .forEach(d => {
                if (d.assignment) {
                  d.assignment.rowVersion =
                    result.data?.assignment?.cancelAssignment?.rowVersion;
                }
              });
          } else {
            allCancellationsSuccessful = false;
          }
        }
      } else {
        localDetailIdsToClearAssignmentsOn.push(
          ...detailsToCancelAssignmentsFor.map(d => d.id!)
        );
        allCancellationsSuccessful = true;
      }

      setVacancy({
        ...vacancy,
        details: updatedDetails.map(d => {
          if (localDetailIdsToClearAssignmentsOn.find(i => d.id === i)) {
            // Clear out any Assignments on the details we store locally
            return {
              ...d,
              assignment: undefined,
            };
          }
          return d;
        }),
      });
      return allCancellationsSuccessful;
    },
    [vacancy, cancelAssignment]
  );

  const vacancySummaryDetails = useMemo(() => {
    const summaryDetails = convertVacancyDetailsFormDataToVacancySummaryDetails(
      vacancy
    );
    return summaryDetails;
  }, [vacancy]);

  const unfilledVacancySummaryDetails = useMemo(() => {
    return vacancySummaryDetails.filter(vsd => !vsd.assignment);
  }, [vacancySummaryDetails]);

  React.useEffect(() => {
    const container = document.getElementById("main-container");
    if (container) container.scrollTop = 0;
  }, [step]);

  const renderClosedDaysBanner = useMemo(() => {
    if (vacancy.closedDetails.length) {
      return (
        <ul>
          {vacancy.closedDetails.map((c, i) => {
            return (
              <li key={`closed-${i}`}>{format(c?.date, "EEE MMMM d, yyyy")}</li>
            );
          })}
        </ul>
      );
    } else {
      return "";
    }
  }, [vacancy.closedDetails]);

  const isDirty = React.useCallback(
    (
      initialValues: VacancyFormValues,
      currentValues: VacancyFormValues,
      formikDirtyFlag: boolean
    ) => {
      // If this is Create or both values are equal, return what Formik thinks
      if (!vacancy.id || isEqual(initialValues, currentValues)) {
        return formikDirtyFlag;
      }

      // Compare the two sets of values excluding the assignment on the details
      const initialVacancyValues: VacancyFormValues = {
        ...initialValues,
        details: initialValues.details.map(d => {
          const { assignment, ...remaining } = d;
          return remaining;
        }),
      };

      const currentVacancyValues: VacancyFormValues = {
        ...currentValues,
        details: currentValues.details.map(d => {
          const { assignment, ...remaining } = d;
          return remaining;
        }),
      };

      return !isEqual(initialVacancyValues, currentVacancyValues);
    },
    [vacancy.id]
  );

  const startDate = startOfDay(min(vacancy.details.map(x => x.date)));

  const footer = React.useCallback(
    (
      initialValues: VacancyFormValues,
      currentValues: VacancyFormValues,
      formikDirtyFlag: boolean,
      isSubmitting: boolean,
      handleReset: (e: any) => void
    ) => {
      const formIsDirty = isDirty(
        initialValues,
        currentValues,
        formikDirtyFlag
      );

      return (
        <ContentFooter>
          <Grid item xs={12} className={classes.contentFooter}>
            <div className={classes.actionButtons}>
              <div className={classes.unsavedText}>
                {formIsDirty && !vacancy.isClosed && (
                  <Typography>{t("This page has unsaved changes")}</Typography>
                )}
              </div>
              {onDelete && vacancyExists && !formIsDirty && (
                <Can do={[PermissionEnum.AbsVacDelete]}>
                  <Button
                    onClick={() => onDelete()}
                    variant="text"
                    className={classes.deleteButton}
                  >
                    {t("Delete")}
                  </Button>
                </Can>
              )}
              {vacancyExists && formIsDirty && !vacancy.isClosed && (
                <Button
                  onClick={handleReset}
                  variant="outlined"
                  className={classes.cancelButton}
                  disabled={!formIsDirty}
                >
                  {t("Discard Changes")}
                </Button>
              )}
              {showAssign && (
                <FilteredAssignmentButton
                  {...{
                    details: vacancySummaryDetails,
                    action: vacancyExists ? "assign" : "pre-arrange",
                    permissionCheck: canAssignSub,
                    disableAction:
                      isSubmitting ||
                      (vacancyExists ? formIsDirty : disableAssign),
                    onClick: (
                      vacancySummaryDetails: VacancySummaryDetail[]
                    ) => {
                      setVacancySummaryDetailsToAssign(vacancySummaryDetails);
                      setStep("preAssignSub");
                    },
                    className: classes.preArrangeButton,
                    isApprovedForSubJobSearch: isApprovedForSubJobSearch,
                  }}
                />
              )}

              <Can
                do={(
                  permissions: OrgUserPermissions[],
                  isSysAdmin: boolean,
                  orgId?: string,
                  forRole?: Role | null | undefined
                ) =>
                  canEditAbsVac(
                    startDate,
                    permissions,
                    isSysAdmin,
                    orgId,
                    forRole,
                    approvalState?.approvalStatusId
                  )
                }
              >
                <Button
                  form="vacancy-form"
                  type="submit"
                  variant="contained"
                  className={classes.saveButton}
                  disabled={
                    vacancyExists
                      ? !formIsDirty || vacancy.isClosed
                      : !showSubmit || isSubmitting
                  }
                >
                  {vacancyExists
                    ? t("Save")
                    : isUnfilled
                    ? t("Create without assigning a substitute")
                    : t("Create")}
                </Button>
              </Can>
            </div>
          </Grid>
        </ContentFooter>
      );
    },
    [
      isDirty,
      classes.contentFooter,
      classes.actionButtons,
      classes.unsavedText,
      classes.deleteButton,
      classes.cancelButton,
      classes.preArrangeButton,
      classes.saveButton,
      vacancy.isClosed,
      t,
      onDelete,
      vacancyExists,
      showAssign,
      vacancySummaryDetails,
      disableAssign,
      isApprovedForSubJobSearch,
      showSubmit,
      isUnfilled,
      setStep,
      startDate,
      approvalState?.approvalStatusId,
    ]
  );

  if (
    getPositionTypes.state === "LOADING" ||
    getLocations.state === "LOADING" ||
    getContracts.state === "LOADING" ||
    getPayCodes.state === "LOADING" ||
    getAccountingCodes.state === "LOADING"
  ) {
    return <></>;
  }

  const positionTypes: any = compact(
    getPositionTypes?.data?.positionType?.all ?? []
  );

  const locations: any = compact(getLocations?.data?.location?.all ?? []);

  const contracts: any = compact(getContracts?.data?.contract?.all ?? []);

  const payCodes: any = compact(getPayCodes?.data?.orgRef_PayCode?.all ?? []);

  const accountingCodes: any = compact(
    getAccountingCodes?.data?.orgRef_AccountingCode?.all ?? []
  ).filter(
    ac => ac.allLocations || ac.locationIds.includes(vacancy.locationId)
  );

  const onCancel = () => {
    setStep("vacancy");
  };

  const subHeader = () => {
    let label = vacancy.title;

    label =
      vacancy.locationId !== "" && locations.length !== 0
        ? `${label}, ${locations.find((l: any) => l.id === vacancy.locationId)
            ?.name ?? ""}`
        : label;
    return vacancy.positionTypeId === "" ? "" : label;
  };

  return (
    <>
      <Typography className={classes.subHeader} variant="h4">
        {subHeader()}
      </Typography>
      {vacancy.closedDetails.length > 0 && (
        <Grid className={classes.closedDayBanner} item xs={12}>
          <Typography>
            {t(
              "The following days were originally part of this vacancy but were removed because of a school closure:"
            )}
          </Typography>
          {renderClosedDaysBanner}
        </Grid>
      )}
      <Formik
        enableReinitialize
        initialValues={initialFormValues}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={yup.object().shape({
          details: yup.array().of(
            yup.object().test({
              name: "accountingCodeAllocationsCheck",
              test: function test(value: VacancyDetailItem) {
                const accountingCodeAllocations =
                  value.accountingCodeAllocations;

                // Any additional validation should go directly into `validateAccountingCodeAllocations`
                // instead of being added directly here. It is also used alongside the dropdown
                // to check for any validation errors
                const error = validateAccountingCodeAllocations(
                  accountingCodeAllocations ?? [],
                  t
                );
                if (!error) {
                  return true;
                }

                return new yup.ValidationError(
                  error,
                  null,
                  `${this.path}.accountingCodeAllocations`
                );
              },
            })
          ),
        })}
        onSubmit={async (data, e) => {
          if (!vacancyExists) {
            if (createVacancy) {
              const result = await createVacancy(vacancy);
              if (result?.data) {
                const createdVacancy = result.data.vacancy?.create;
                setVacancy({
                  ...vacancy,
                  id: createdVacancy?.id ?? "",
                  details: vacancy.details.map(d => {
                    const matchingDetail = createdVacancy?.details?.find(cvd =>
                      isSameDay(parseISO(cvd?.startDate), d.date)
                    );
                    const assignedEmployee =
                      matchingDetail?.assignment?.employee ??
                      d.assignment?.employee;
                    return {
                      ...d,
                      id: matchingDetail?.id ?? undefined,
                      saved: matchingDetail ? true : false,
                      assignment: matchingDetail?.assignment
                        ? {
                            id: matchingDetail.assignment.id,
                            rowVersion: matchingDetail.assignment.rowVersion,
                            employee: assignedEmployee
                              ? {
                                  id: assignedEmployee.id,
                                  firstName: assignedEmployee.firstName,
                                  lastName: assignedEmployee.lastName,
                                  email: assignedEmployee.email ?? undefined,
                                }
                              : undefined,
                          }
                        : undefined,
                    };
                  }),
                });
                setStep("confirmation");
              }
            }
          } else {
            if (updateVacancy) {
              const result = await updateVacancy(vacancy);
              if (result.data) {
                const updatedVacancy = result.data.vacancy?.update;
                const updatedDetails = updatedVacancy?.details;
                const updatedFormData = {
                  ...vacancy,
                  details: vacancy.details.map(d => {
                    const matchingDetail = updatedDetails?.find(ud =>
                      isSameDay(parseISO(ud?.startDate), d.date)
                    );
                    return {
                      ...d,
                      id: matchingDetail?.id ?? undefined,
                      saved: matchingDetail ? true : false,
                    };
                  }),
                };
                setVacancy(updatedFormData);
                e.resetForm({
                  values: {
                    positionTypeId: updatedFormData.positionTypeId,
                    title: updatedFormData.title,
                    locationId: updatedFormData.locationId,
                    locationName: updatedFormData.locationName,
                    contractId: updatedFormData.contractId,
                    workDayScheduleId: updatedFormData.workDayScheduleId,
                    details: updatedFormData.details,
                    notesToReplacement: updatedFormData.notesToReplacement,
                    adminOnlyNotes: updatedFormData.adminOnlyNotes,
                  },
                });
              }
            }
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
          initialValues,
        }) => (
          <form id="vacancy-form" onSubmit={handleSubmit}>
            <Prompt
              message={location => {
                if (
                  step === "confirmation" ||
                  (vacancyExists
                    ? match.url === location.pathname ||
                      !isDirty(initialValues, values, dirty)
                    : match.url === location.pathname ||
                      (!showSubmit && !isSubmitting))
                ) {
                  return true;
                }

                const msg = vacancyExists
                  ? t(
                      "Click DISCARD CHANGES to leave this page and lose all unsaved changes."
                    )
                  : t(
                      "Click DISCARD CHANGES to leave this page and not create a new vacancy."
                    );
                return msg;
              }}
            />
            {step === "vacancy" && (
              <>
                {approvalState && (
                  <Can do={[PermissionEnum.AbsVacApprovalsView]}>
                    <div className={classes.approvalBannerContainer}>
                      <ApprovalState
                        orgId={params.organizationId}
                        approvalState={approvalState}
                        isTrueVacancy={true}
                        vacancyId={vacancy.id}
                        onChange={props.refetchVacancy}
                      />
                    </div>
                  </Can>
                )}
                <Grid
                  container
                  justify="space-between"
                  className={classes.container}
                >
                  <Grid item xs={12} sm={6} className={classes.vacDetailColumn}>
                    <VacancyDetailSection
                      key={String(resetKey)}
                      orgId={params.organizationId}
                      values={vacancy}
                      setFieldValue={setFieldValue}
                      positionTypes={positionTypes}
                      locations={locations}
                      payCodes={payCodes}
                      accountingCodes={accountingCodes}
                      contracts={contracts}
                      setVacancy={setVacancy}
                      readOnly={false}
                      vacancyExists={vacancyExists}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Grid item xs={12}>
                      <Typography
                        className={classes.subDetailtitle}
                        variant="h6"
                      >
                        {t("Substitute Details")}
                      </Typography>
                    </Grid>
                    <VacancySummary
                      vacancySummaryDetails={vacancySummaryDetails}
                      onAssignClick={async (
                        vacancySummaryDetails: VacancySummaryDetail[]
                      ) => {
                        setVacancySummaryDetailsToAssign(vacancySummaryDetails);
                        setStep("preAssignSub");
                      }}
                      onCancelAssignment={onCancelAssignment}
                      notesForSubstitute={
                        vacancy.notesToReplacement ?? undefined
                      }
                      setNotesForSubstitute={(notes: string) => {
                        setFieldValue("notesToReplacement", notes);
                        vacancy.notesToReplacement = notes;
                      }}
                      showPayCodes={payCodes.length > 0}
                      showAccountingCodes={accountingCodes.length > 0}
                      assignAction={vacancyExists ? "assign" : "pre-arrange"}
                      isApprovedForSubJobSearch={isApprovedForSubJobSearch}
                    />
                  </Grid>
                </Grid>
                {footer(
                  initialValues,
                  values,
                  dirty,
                  isSubmitting,
                  handleReset
                )}
              </>
            )}
            {step === "preAssignSub" && (
              <AssignSub
                isForVacancy={true}
                orgId={params.organizationId}
                onAssignReplacement={onAssignSub}
                onCancel={onCancel}
                positionName={
                  positionTypes.find(
                    (pt: any) => vacancy.positionTypeId === pt.id
                  )?.name
                }
                vacancySummaryDetails={
                  vacancySummaryDetailsToAssign ??
                  unfilledVacancySummaryDetails ??
                  []
                }
                vacancy={
                  vacancyExists
                    ? undefined
                    : buildVacancyCreateInput({
                        ...vacancy,
                        details: vacancy.details.filter(d =>
                          (
                            vacancySummaryDetailsToAssign ??
                            unfilledVacancySummaryDetails ??
                            []
                          ).find(vsd => vsd.vacancyDetailId === d.id)
                        ),
                      })
                }
                vacancyId={vacancyExists ? vacancy.id : undefined}
                existingVacancy={vacancyExists}
                vacancyDetailIdsToAssign={
                  vacancyExists
                    ? (
                        vacancySummaryDetailsToAssign ??
                        unfilledVacancySummaryDetails ??
                        []
                      ).map(vsd => vsd.vacancyDetailId)
                    : undefined
                }
                employeeToReplace={
                  vacancySummaryDetailsToAssign
                    ? vacancySummaryDetailsToAssign[0]?.assignment?.employee
                        ?.firstName ?? undefined
                    : undefined
                }
                selectButtonText={vacancyExists ? t("Assign") : undefined}
                isApprovedForSubJobSearch={isApprovedForSubJobSearch}
              />
            )}
            {step === "confirmation" && (
              <VacancyConfirmation
                vacancyId={vacancy.id}
                orgId={params.organizationId}
                setStep={setStep}
                vacancySummaryDetails={vacancySummaryDetails}
                notes={vacancy.notesToReplacement ?? ""}
                values={vacancy}
                locations={locations}
                positionTypes={positionTypes}
                contracts={contracts}
                onCancelAssignment={onCancelAssignment}
                orgHasPayCodesDefined={payCodes.length > 0}
                orgHasAccountingCodesDefined={accountingCodes.length > 0}
                isApprovedForSubJobSearch={isApprovedForSubJobSearch}
                resetVacancy={resetVacancy}
              />
            )}
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      5
    )} ${theme.typography.pxToRem(5)}`,
    padding: theme.spacing(3),
  },
  approvalBannerContainer: {
    marginBottom: theme.spacing(2),
  },
  subHeader: {
    minHeight: theme.typography.pxToRem(60),
  },
  vacDetailColumn: {
    marginRight: theme.typography.pxToRem(20),
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
  saveButton: {
    marginRight: theme.spacing(4),
  },
  preArrangeButton: {
    marginRight: theme.spacing(2),
  },
  subDetailtitle: {
    marginBottom: theme.typography.pxToRem(15),
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
  closedDayBanner: {
    marginTop: theme.typography.pxToRem(5),
    backgroundColor: theme.customColors.yellow1,
    padding: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(4),
    marginBottom: theme.typography.pxToRem(15),
    border: `1px solid ${theme.customColors.sectionBorder}`,
  },
}));
