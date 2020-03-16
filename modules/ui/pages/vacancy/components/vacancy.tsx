import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Button } from "@material-ui/core";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useState, useMemo } from "react";
import { useRouteParams } from "ui/routes/definition";
import {
  VacancyDetailInput,
  PermissionEnum,
  Vacancy,
  Assignment,
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
import Maybe from "graphql/tsutils/Maybe";
import { Prompt, useRouteMatch } from "react-router";
import { buildVacancyCreateInput } from "../helpers";
import { AssignVacancy } from "../graphql/assign-vacancy.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { CancelAssignment } from "../graphql/cancel-assignment.gen";

export type VacancyDetailsFormData = {
  id: string;
  positionTypeId: string;
  title: string;
  contractId: string;
  locationId: string;
  workDayScheduleId: string;
  notesToReplacement?: string | null;
  details: VacancyDetailInput[];
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  assignmentId?: string;
  assignmentRowVersion?: string;
  ignoreWarnings?: boolean;
  orgId: string;
  rowVersion: string;
};

type Props = {
  vacancy: VacancyDetailsFormData;
  createVacancy?: (
    v: VacancyDetailsFormData
  ) => Promise<
    ExecutionResult<
      {
        __typename?: "Mutation" | undefined;
      } & {
        vacancy: Maybe<
          {
            __typename?: "VacancyMutations" | undefined;
          } & {
            create: Maybe<
              {
                __typename?: "Vacancy" | undefined;
              } & Pick<Vacancy, "id" | "rowVersion" | "details">
            >;
          }
        >;
      }
    >
  >;
  updateVacancy?: (
    v: VacancyDetailsFormData
  ) => Promise<
    ExecutionResult<
      {
        __typename?: "Mutation" | undefined;
      } & {
        vacancy: Maybe<
          {
            __typename?: "VacancyMutations" | undefined;
          } & {
            update: Maybe<
              {
                __typename?: "Vacancy" | undefined;
              } & Pick<Vacancy, "id" | "rowVersion" | "details">
            >;
          }
        >;
      }
    >
  >;
  onDelete?: () => void;
};

export const VacancyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(VacancyCreateRoute);
  const [step, setStep] = useQueryParamIso(VacancyStepParams);
  const { openSnackbar } = useSnackbar();
  const [hasSub, setHasSub] = useState(
    props.vacancy.replacementEmployeeName ?? ""
  );
  const [vacancyId, setVacancyId] = useState("");
  const match = useRouteMatch();

  const vacancyExists = useMemo(() => {
    return props.vacancy.id ? true : false;
  }, [
    props.vacancy,
    props,
  ]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const [vacancy, setVacancy] = useState<VacancyDetailsFormData>(props.vacancy);

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

  const showAssign: boolean = useMemo(() => {
    if (
      vacancy &&
      vacancy.positionTypeId &&
      vacancy.locationId &&
      vacancy.contractId &&
      vacancy.details &&
      vacancy.details.length > 0 &&
      !hasSub
    ) {
      return true;
    } else {
      return false;
    }
  }, [vacancy, hasSub]);

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
  }, [vacancy, hasSub]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onAssignSub = React.useCallback(
    async (
      replacementId: string,
      replacementName: string,
      payCode: string | undefined
    ) => {
      vacancy.details.forEach(d => {
        d.prearrangedReplacementEmployeeId = replacementId;
      });

      if (vacancyExists) {
        if (hasSub && vacancy.assignmentId && vacancy.assignmentRowVersion) {
          //first cancel all assignments before assigning new sub
          await onCancelAssignment();
        }
        const result = await assignVacancy({
          variables: {
            assignment: {
              orgId: params.organizationId,
              vacancyId: vacancy.id,
              employeeId: replacementId,
              appliesToAllVacancyDetails: true,
              ignoreWarnings: true,
            },
          },
        });
        const assignment = result?.data?.vacancy?.assignVacancy as Assignment;
        if (assignment) {
          setVacancy({
            ...vacancy,
            assignmentId: assignment.id,
            assignmentRowVersion: assignment.rowVersion,
          });
          setHasSub(replacementName);
        }
      } else {
        setHasSub(replacementName);
      }

      setStep("vacancy");
    },
    [setStep, vacancy] /* eslint-disable-line react-hooks/exhaustive-deps */
  );

  const onCancelAssignment = React.useCallback(
    async (vacancyDetailIds?: string[]) => {
      const result = await cancelAssignment({
        variables: {
          assignment: {
            assignmentId: vacancy.assignmentId ?? "",
            rowVersion: vacancy.assignmentRowVersion ?? "",
            vacancyDetailIds:
              vacancyDetailIds && vacancyDetailIds.length > 0
                ? vacancyDetailIds
                : undefined,
          },
        },
      });

      if (result?.data) {
        setVacancy({
          ...vacancy,
          assignmentId: undefined,
          assignmentRowVersion: undefined,
        });
        setHasSub("");
      }
    },
    [vacancy, cancelAssignment]
  );

  const onUnassignSub = React.useCallback(async () => {
    vacancy.details.forEach(d => {
      d.prearrangedReplacementEmployeeId = undefined;
    });

    if (vacancyExists) {
      await onCancelAssignment();
    } else {
      setHasSub("");
    }
  }, [vacancy, onCancelAssignment, vacancyExists]);

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
      .sort((a, b) => a.date - b.date)
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
          contractId: vacancy.contractId,
          workDayScheduleId: vacancy.workDayScheduleId,
          details: vacancy.details,
          notesToReplacement: vacancy.notesToReplacement,
        }}
        onSubmit={async (data, e) => {
          if (!vacancyExists) {
            if (props.createVacancy) {
              const result = await props.createVacancy(vacancy);
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
                });
                setStep("confirmation");
                e.resetForm();
              }
            }
          } else {
            if (props.updateVacancy) {
              const result = await props.updateVacancy(vacancy);
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
                    {hasSub && (
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
                    )}
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
                      {props.onDelete && vacancyExists && !dirty && (
                        <Button
                          onClick={() => props.onDelete!()}
                          variant="text"
                          className={classes.deleteButton}
                        >
                          {t("Delete")}
                        </Button>
                      )}
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
                            vacancyExists ? dirty : !showAssign || isSubmitting
                          }
                          className={classes.preArrangeButton}
                          onClick={() => {
                            setStep("preAssignSub");
                          }}
                        >
                          {!vacancyExists
                            ? t("Pre-arrange")
                            : hasSub
                            ? t("Reassign")
                            : t("Assign")}
                        </Button>
                      </Can>
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
                            : hasSub
                            ? t("Create")
                            : t("Create without assigning a substitute")}
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
                vacancyScheduleDays={buildScheduleDays(vacancy)}
                vacancy={
                  vacancyExists ? undefined : buildVacancyCreateInput(vacancy)
                }
                vacancyId={vacancyExists ? vacancy.id : undefined}
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
                replacementEmployeeName={hasSub}
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
