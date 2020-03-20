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
import {
  VacancyScheduleDay,
  VacancySubstituteDetailsSection,
} from "./vacancy-substitute-details-section";
import { Formik } from "formik";
import { VacancyDetailSection } from "./vacancy-details-section";
import { AssignedSub } from "ui/components/absence/assigned-sub";
import { ContentFooter } from "ui/components/content-footer";
import { OrgUserPermissions } from "ui/components/auth/types";
import { Can } from "ui/components/auth/can";
import { canAssignSub } from "helpers/permissions";
import { parseISO, isSameDay } from "date-fns";
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
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary/vacancy-summary";
import { CreateVacancyMutation } from "../graphql/create-vacancy.gen";
import { UpdateVacancyMutation } from "../graphql/update-vacancy.gen";
import { convertVacancyDetailsFormDataToVacancySummaryDetails } from "ui/components/absence-vacancy/vacancy-summary/helpers";
import { vacancyReducer } from "../state";
import { AssignmentFor } from "ui/components/absence-vacancy/vacancy-summary/types";

export type VacancyDetailsFormData = {
  id: string;
  positionTypeId: string;
  title: string;
  contractId: string;
  locationId: string;
  locationName: string;
  workDayScheduleId: string;
  notesToReplacement?: string | null;
  details: VacancyDetailItem[];
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  assignmentId?: string;
  assignmentRowVersion?: string;
  ignoreWarnings?: boolean;
  orgId: string;
  rowVersion: string;
};

export type VacancyDetailItem = {
  id?: string;
  date: Date;
  startTime: number;
  endTime: number;
  locationId: string;
  payCodeId?: string;
  payCodeName?: string;
  accountingCodeAllocations?: {
    accountingCodeId: string;
    accountingCodeName: string;
    allocation: number;
  }[];
  vacancyReasonId: string;
  assignment?: {
    id?: string;
    rowVersion?: string;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
};

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

  const [state, dispatch] = useReducer(vacancyReducer, {
    vacancyDetailIdsToAssign: [],
  });

  const vacancyExists = useMemo(() => {
    return initialVacancy.id ? true : false;
  }, [initialVacancy]);

  const [vacancyId, setVacancyId] = useState("");
  const [vacancy, setVacancy] = useState<VacancyDetailsFormData>(
    initialVacancy
  );

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
            d => !!d.assignment?.id && vacancyDetailIds.find(i => i === d.id)
          )
        : vacancy.details.filter(d => !!d.assignment?.id);

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
      setVacancy({
        ...vacancy,
        details: vacancy.details.map(d => {
          if (!localDetailIdsToClearAssignmentsOn?.find(i => d.id === i)) {
            return d;
          }

          return {
            ...d,
            assignment: undefined,
          };
        }),
      });
    },
    [vacancy, cancelAssignment]
  );

  const vacancySummaryDetails = useMemo(() => {
    return convertVacancyDetailsFormDataToVacancySummaryDetails(vacancy);
  }, [vacancy]);

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
  );

  const onCancel = () => {
    setStep("vacancy");
  };

  const subHeader = () => {
    let label = vacancy.title;

    label =
      vacancy.locationId !== "" && locations.length !== 0
        ? `${label}, ${locations.find((l: any) => l.id === vacancy.locationId)
            .name ?? ""}`
        : label;
    return vacancy.positionTypeId === "" ? "" : label;
  };

  const buildScheduleDays = (
    vacancy: VacancyDetailsFormData
  ): VacancyScheduleDay[] => {
    return vacancy.details
      .sort((a, b) => +a.date - +b.date)
      .map((d: VacancyDetailInput) => {
        return {
          positionTitle: positionTypes.find(
            (pt: any) => vacancy.positionTypeId === pt.id
          )?.name,
          date: d.date,
          startTime: d.startTime,
          endTime: d.endTime,
          location: locations.find((l: any) => vacancy.locationId === l.id)
            ?.name,
          payCode: payCodes.find((p: any) => d.payCodeId === p.id)?.name,

          accountingCode: !d.accountingCodeAllocations
            ? undefined
            : accountingCodes.find((a: any) =>
                d.accountingCodeAllocations
                  ? a.id === d.accountingCodeAllocations[0]?.accountingCodeId
                  : false
              )?.name,
        };
      });
  };

  return (
    <>
      <Typography className={classes.subHeader} variant="h4">
        {subHeader()}
      </Typography>
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
        }}
        onSubmit={async (data, e) => {
          if (!vacancyExists) {
            if (createVacancy) {
              const result = await createVacancy(vacancy);
              if (result.data) {
                const createdVacancy = result.data.vacancy?.create;
                setVacancyId(createdVacancy?.id ?? "");
                const assignment = createdVacancy?.details
                  ? createdVacancy?.details[0]?.assignment
                  : undefined;
                setVacancy({
                  ...vacancy,
                  id: result.data.vacancy?.create?.id ?? "",
                  assignmentId: assignment?.id,
                  assignmentRowVersion: assignment?.rowVersion,
                  // ALSO SET THE ASSIGNMENT AND IDS ON THE DETAILS BY DATE
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
                    return {
                      ...d,
                      id:
                        updatedDetails?.find(ud =>
                          isSameDay(parseISO(ud?.startDate), d.date)
                        )?.id ?? undefined,
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
                    />
                    {/* {hasSub && (
                      <Grid item xs={12}>
                        <AssignedSub
                          employeeId={
                            vacancy.details[0]
                              .prearrangedReplacementEmployeeId ?? ""
                          }
                          employeeName={hasSub}
                          subText={
                            vacancyExists ? t("assigned") : t("pre-arranged")
                          }
                          vacancies={[]}
                          assignmentStartDate={vacancy.details[0].date}
                          assignmentsByDate={vacancy.details.map(d => {
                            return { date: d.date };
                          })}
                          onCancelAssignment={onUnassignSub}
                        />
                      </Grid>
                    )} */}
                    <VacancySubstituteDetailsSection
                      scheduleDays={buildScheduleDays(vacancy)}
                      showNotes={true}
                      notes={vacancy.notesToReplacement ?? undefined}
                      onNotesChange={(n: string) => {
                        setFieldValue("notesToReplacement", n);
                        vacancy.notesToReplacement = n;
                      }}
                    />
                  </Grid>
                </Grid>
                <ContentFooter>
                  <Grid item xs={12} className={classes.contentFooter}>
                    <div className={classes.actionButtons}>
                      <div className={classes.unsavedText}>
                        {dirty && (
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
                            vacancyExists ? !dirty : !showSubmit || isSubmitting
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
                userIsAdmin={true}
                orgId={params.organizationId}
                onAssignReplacement={onAssignSub}
                onCancel={onCancel}
                assignmentsByDate={[]}
                positionName={
                  positionTypes.find(
                    (pt: any) => vacancy.positionTypeId === pt.id
                  )?.name
                }
                vacancySummaryDetails={vacancySummaryDetails.filter(d =>
                  state.vacancyDetailIdsToAssign.find(
                    i => d.vacancyDetailId === i
                  )
                )}
                vacancy={
                  vacancyExists ? undefined : buildVacancyCreateInput(vacancy)
                }
                vacancyId={vacancyExists ? vacancy.id : undefined}
                vacancyDetailIdsToAssign={state.vacancyDetailIdsToAssign}
              />
            )}
            {step === "confirmation" && (
              <VacancyConfirmation
                vacancyId={vacancyId}
                orgId={params.organizationId}
                setStep={setStep}
                scheduleDays={buildScheduleDays(vacancy)}
                notes={vacancy.notesToReplacement ?? ""}
                values={vacancy}
                locations={locations}
                positionTypes={positionTypes}
                contracts={contracts}
                setVacancyForCreate={setVacancy}
                unassignSub={onCancelAssignment}
                replacementEmployeeName={""}
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
}));
