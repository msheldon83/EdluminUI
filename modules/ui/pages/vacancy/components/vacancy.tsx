import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Button } from "@material-ui/core";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useState, useMemo, useReducer } from "react";
import { useRouteParams } from "ui/routes/definition";
import {
  VacancyDetailInput,
  PermissionEnum,
  Vacancy,
  Assignment,
  CancelVacancyAssignmentInput,
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
import { OrgUserPermissions } from "ui/components/auth/types";
import { Can } from "ui/components/auth/can";
import { canAssignSub } from "helpers/permissions";
import { parseISO, isSameDay, format } from "date-fns";
import { AssignSub } from "ui/components/assign-sub";
import { VacancyConfirmation } from "./vacancy-confirmation";
import { compact } from "lodash-es";
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
import { vacancyReducer } from "../state";
import { AssignmentFor } from "ui/components/absence-vacancy/vacancy-summary/types";
import { VacancyDetailsFormData } from "../helpers/types";
import { GetVacancyReasonsForOrg } from "../graphql/get-all-vacancy-reasons.gen";

type Props = {
  initialVacancy: VacancyDetailsFormData;
  createVacancy?: (
    v: VacancyDetailsFormData
  ) => Promise<ExecutionResult<CreateVacancyMutation>>;
  updateVacancy?: (
    v: VacancyDetailsFormData
  ) => Promise<ExecutionResult<UpdateVacancyMutation>>;
  onDelete?: () => void;
};

export const VacancyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(VacancyCreateRoute);
  const [step, setStep] = useQueryParamIso(VacancyStepParams);
  const { openSnackbar } = useSnackbar();
  const match = useRouteMatch();
  const { initialVacancy, createVacancy, updateVacancy, onDelete } = props;
  const [resetKey, setResetKey] = useState(0);

  const [state, dispatch] = useReducer(vacancyReducer, {
    vacancyDetailIdsToAssign: [],
  });

  const [vacancy, setVacancy] = useState<VacancyDetailsFormData>({
    ...initialVacancy,
  });
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

  const getvacancyReasons = useQueryBundle(GetVacancyReasonsForOrg, {
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

  const onAssignSub = React.useCallback(
    async (
      replacementEmployeeId: string,
      replacementEmployeeFirstName: string,
      replacementEmployeeLastName: string,
      payCode: string | undefined,
      vacancyDetailIds?: string[]
    ) => {
      // Get all of the matching details
      const detailsToAssign = vacancyDetailIds
        ? vacancy.details.filter(d => vacancyDetailIds.find(i => i === d.id))
        : vacancy.details;
      if (vacancy.id) {
        // Cancel any existing assignments on these Details
        await onCancelAssignment(vacancyDetailIds);

        // Create an Assignment for these Details
        const result = await assignVacancy({
          variables: {
            assignment: {
              orgId: params.organizationId,
              vacancyId: vacancy.id,
              employeeId: replacementEmployeeId,
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
                    id: replacementEmployeeId,
                    firstName: replacementEmployeeFirstName,
                    lastName: replacementEmployeeLastName,
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
            if (!vacancyDetailIds?.find(i => d.id === i)) {
              return d;
            }

            return {
              ...d,
              assignment: {
                employee: {
                  id: replacementEmployeeId,
                  firstName: replacementEmployeeFirstName,
                  lastName: replacementEmployeeLastName,
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
    async (vacancyDetailIds?: string[]) => {
      // Get all of the matching details
      const detailsToCancelAssignmentsFor = vacancyDetailIds
        ? vacancy.details.filter(
            d => d.assignment && !!vacancyDetailIds.find(i => i === d.id)
          )
        : vacancy.details.filter(d => d.assignment);

      const localDetailIdsToClearAssignmentsOn: string[] = [];
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
          if (result?.data && a.vacancyDetailIds) {
            localDetailIdsToClearAssignmentsOn.push(...a.vacancyDetailIds);
          }
        }
      } else {
        localDetailIdsToClearAssignmentsOn.push(
          ...detailsToCancelAssignmentsFor.map(d => d.id!)
        );
      }

      // Clear out any Assignments on the details we store locally
      const updatedDetails = vacancy.details.map(d => {
        if (localDetailIdsToClearAssignmentsOn.find(i => d.id === i)) {
          return {
            ...d,
            assignment: undefined,
          };
        }
        return d;
      });
      setVacancy({
        ...vacancy,
        details: updatedDetails,
      });
    },
    [vacancy, cancelAssignment]
  );

  const vacancySummaryDetails = useMemo(() => {
    const summaryDetails = convertVacancyDetailsFormDataToVacancySummaryDetails(
      vacancy
    );
    return summaryDetails;
  }, [vacancy]);

  const vacancySummaryDetailsToAssign = useMemo(() => {
    return vacancySummaryDetails.filter(d =>
      state.vacancyDetailIdsToAssign.find(i => d.vacancyDetailId === i)
    );
  }, [vacancySummaryDetails, state.vacancyDetailIdsToAssign]);

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

  if (
    getPositionTypes.state === "LOADING" ||
    getLocations.state === "LOADING" ||
    getContracts.state === "LOADING" ||
    getPayCodes.state === "LOADING" ||
    getAccountingCodes.state === "LOADING" ||
    getvacancyReasons.state === "LOADING"
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
  );

  const vacancyReasons: any = compact(
    getvacancyReasons?.data?.orgRef_VacancyReason?.all ?? []
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
        initialValues={{
          positionTypeId: vacancy.positionTypeId,
          title: vacancy.title,
          locationId: vacancy.locationId,
          locationName: vacancy.locationName,
          contractId: vacancy.contractId,
          workDayScheduleId: vacancy.workDayScheduleId,
          details: vacancy.details,
          notesToReplacement: vacancy.notesToReplacement,
          adminOnlyNotes: vacancy.adminOnlyNotes,
        }}
        onReset={(values, e) => {
          setResetKey(resetKey + 1);
          setVacancy({ ...initialVacancy });
          e.resetForm({
            values: {
              positionTypeId: initialVacancy.positionTypeId,
              title: initialVacancy.title,
              locationId: initialVacancy.locationId,
              locationName: initialVacancy.locationName,
              contractId: initialVacancy.contractId,
              workDayScheduleId: initialVacancy.workDayScheduleId,
              details: initialVacancy.details,
              notesToReplacement: initialVacancy.notesToReplacement,
              adminOnlyNotes: initialVacancy.adminOnlyNotes,
            },
          });
        }}
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
                    return {
                      ...d,
                      id: matchingDetail?.id ?? undefined,
                      saved: matchingDetail ? true : false,
                      assignment: matchingDetail?.assignment
                        ? {
                            id: matchingDetail.assignment.id,
                            rowVersion: matchingDetail.assignment.rowVersion,
                            employee: matchingDetail.assignment.employee
                              ? matchingDetail.assignment.employee
                              : d.assignment?.employee,
                          }
                        : undefined,
                    };
                  }),
                });
                setStep("confirmation");
                e.resetForm();
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
          resetForm,
          touched,
        }) => (
          <form id="vacancy-form" onSubmit={handleSubmit}>
            <Prompt
              message={location => {
                if (
                  vacancyExists
                    ? match.url === location.pathname || !dirty
                    : match.url === location.pathname ||
                      (!showSubmit && !isSubmitting)
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
                      vacancyReasons={vacancyReasons}
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
                      onAssignClick={(currentAssignmentInfo: AssignmentFor) => {
                        dispatch({
                          action: "setVacancyDetailIdsToAssign",
                          vacancyDetailIdsToAssign:
                            currentAssignmentInfo.vacancyDetailIds,
                        });
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
                    />
                  </Grid>
                </Grid>
                <ContentFooter>
                  <Grid item xs={12} className={classes.contentFooter}>
                    <div className={classes.actionButtons}>
                      <div className={classes.unsavedText}>
                        {dirty && !vacancy.isClosed && (
                          <Typography>
                            {t("This page has unsaved changes")}
                          </Typography>
                        )}
                      </div>
                      {onDelete && vacancyExists && !dirty && (
                        <Button
                          onClick={() => onDelete()}
                          variant="text"
                          className={classes.deleteButton}
                        >
                          {t("Delete")}
                        </Button>
                      )}
                      {vacancyExists && dirty && !vacancy.isClosed && (
                        <Button
                          onClick={handleReset}
                          variant="outlined"
                          className={classes.cancelButton}
                          disabled={!dirty}
                        >
                          {t("Discard Changes")}
                        </Button>
                      )}
                      {showAssign && (
                        <Can
                          do={(
                            permissions: OrgUserPermissions[],
                            isSysAdmin: boolean,
                            orgId?: string
                          ) =>
                            canAssignSub(
                              parseISO(new Date().toString()),
                              permissions,
                              isSysAdmin,
                              orgId
                            )
                          }
                        >
                          <Button
                            variant="outlined"
                            disabled={
                              vacancyExists
                                ? dirty
                                : disableAssign || isSubmitting
                            }
                            className={classes.preArrangeButton}
                            onClick={() => {
                              dispatch({
                                action: "setVacancyDetailIdsToAssign",
                                vacancyDetailIdsToAssign: vacancySummaryDetails.map(
                                  d => d.vacancyDetailId
                                ),
                              });
                              setStep("preAssignSub");
                            }}
                          >
                            {!vacancyExists ? t("Pre-arrange") : t("Assign")}
                          </Button>
                        </Can>
                      )}

                      <Can do={[PermissionEnum.AbsVacSave]}>
                        <Button
                          form="vacancy-form"
                          type="submit"
                          variant="contained"
                          className={classes.saveButton}
                          disabled={
                            vacancyExists
                              ? !dirty || vacancy.isClosed
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
              </>
            )}
            {step === "preAssignSub" && (
              <AssignSub
                isForVacancy={true}
                orgId={params.organizationId}
                onAssignReplacement={onAssignSub}
                onCancel={onCancel}
                assignmentsByDate={[]}
                positionName={
                  positionTypes.find(
                    (pt: any) => vacancy.positionTypeId === pt.id
                  )?.name
                }
                vacancySummaryDetails={vacancySummaryDetailsToAssign}
                vacancy={
                  vacancyExists
                    ? undefined
                    : buildVacancyCreateInput({
                        ...vacancy,
                        details: vacancy.details.filter(d =>
                          state.vacancyDetailIdsToAssign.find(s => s === d.id)
                        ),
                      })
                }
                vacancyId={vacancyExists ? vacancy.id : undefined}
                existingVacancy={vacancyExists}
                vacancyDetailIdsToAssign={state.vacancyDetailIdsToAssign}
                employeeToReplace={
                  vacancySummaryDetailsToAssign[0]?.assignment?.employee
                    ?.firstName ?? undefined
                }
                orgHasPayCodesDefined={payCodes.length > 0}
                orgHasAccountingCodesDefined={accountingCodes.length > 0}
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
                setVacancyForCreate={setVacancy}
                onCancelAssignment={onCancelAssignment}
                vacancyReasons={vacancyReasons}
                orgHasPayCodesDefined={payCodes.length > 0}
                orgHasAccountingCodesDefined={accountingCodes.length > 0}
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
    borderTopWidth: 0,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      5
    )} ${theme.typography.pxToRem(5)}`,
    padding: theme.spacing(3),
  },
  subHeader: {
    height: theme.typography.pxToRem(60),
  },
  vacDetailColumn: {
    marginRight: theme.typography.pxToRem(20),
  },
  contentFooter: {
    height: theme.typography.pxToRem(72),
    width: "100%",
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
