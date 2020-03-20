import { makeStyles, Typography } from "@material-ui/core";
import { format, formatISO, isPast, isSameDay, parseISO } from "date-fns";
import { startOfMonth } from "date-fns/esm";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  Absence,
  AbsenceDetailCreateInput,
  AbsenceUpdateInput,
  AbsenceVacancyInput,
  DayPart,
  NeedsReplacement,
  PermissionEnum,
  Vacancy,
} from "graphql/server-types.gen";
import {
  AbsenceReasonUsageData,
  computeAbsenceUsageText,
} from "helpers/absence/computeAbsenceUsageText";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { convertStringToDate } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useQueryParamIso } from "hooks/query-params";
import { useDialog } from "hooks/use-dialog";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { compact, differenceWith, flatMap, isEqual, some } from "lodash-es";
import * as React from "react";
import { useCallback, useMemo, useReducer, useState } from "react";
import useForm from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AbsenceDetails } from "ui/components/absence/absence-details";
import {
  getCannotCreateAbsenceDates,
  TranslateAbsenceErrorCodeToMessage,
  vacancyDetailsHaveDifferentAccountingCodeSelections,
  vacancyDetailsHaveDifferentPayCodeSelections,
} from "ui/components/absence/helpers";
import { ActionMenu } from "ui/components/action-menu";
import { ShowIgnoreAndContinueOrError } from "ui/components/error-helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import {
  VacancyDetail,
  AssignmentOnDate,
} from "../../components/absence/types";
import { AssignSub } from "../../components/assign-sub";
import { EditVacancies } from "../create-absence/edit-vacancies";
import { GetProjectedAbsenceUsage } from "../create-absence/graphql/get-projected-absence-usage.gen";
import { GetProjectedVacancies } from "../create-absence/graphql/get-projected-vacancies.gen";
import { projectVacancyDetails } from "../create-absence/project-vacancy-details";
import { buildAbsenceCreateInput } from "../create-absence/ui";
import { AssignVacancy } from "./graphql/assign-vacancy.gen";
import { UpdateAbsence } from "./graphql/update-absence.gen";
import { editAbsenceReducer, EditAbsenceState } from "./state";
import { StepParams } from "./step-params";
import { DiscardChangesDialog } from "./discard-changes-dialog";
import { Prompt, useRouteMatch } from "react-router";
import { OrgUserPermissions } from "ui/components/auth/types";
import { canViewAsSysAdmin } from "helpers/permissions";
import { VacancyNotificationLogRoute } from "ui/routes/notification-log";
import { useHistory } from "react-router";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { AbsenceActivityLogRoute } from "ui/routes/absence-vacancy/activity-log";

type Props = {
  firstName: string;
  lastName: string;
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
  needsReplacement: NeedsReplacement;
  notesToApprover?: string;
  userIsAdmin: boolean;
  positionId?: string;
  positionName?: string;
  absenceReason: {
    id: string;
    name: string;
  };
  trackingBalanceReasonIds: Array<string | undefined>;
  absenceId: string;
  assignmentId?: string;
  dayPart?: DayPart;
  initialVacancyDetails: VacancyDetail[];
  initialVacancies: Vacancy[];
  initialAbsenceUsageData: AbsenceReasonUsageData[];
  rowVersion: string;
  absenceDetailsIdsByDate: Record<string, string>;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  locationIds?: string[];
  startTimeLocal: string;
  endTimeLocal: string;
  absenceDates: Date[];
  cancelAssignments: (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[],
    preventAbsenceRefetch?: boolean
  ) => Promise<void>;
  refetchAbsence: () => Promise<unknown>;
  onDelete: () => void;
  returnUrl?: string;
  assignmentsByDate: AssignmentOnDate[];
};

type EditAbsenceFormData = {
  absenceReason: string;
  dayPart?: DayPart;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  notesToApprover?: string;
  notesToReplacement?: string;
  vacancies?: AbsenceVacancyInput[];
  accountingCode?: string;
  payCode?: string;
};

/*
 * We're allowing @ts-ignore comments in this file because of a difficult problem.
 * It appears that something to do with the generated types for GetAbsence cause
 * spurious errors to be emitted from typescript. Hopefully this is an isolated
 * problem. If not, we'll need to figure out a proper fix.
 */
/* eslint-disable @typescript-eslint/ban-ts-ignore */

export const EditAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openDialog } = useDialog();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const match = useRouteMatch();
  const [vacancyDetailIdsToAssign, setVacancyDetailIdsToAssign] = useState<
    string[] | undefined
  >(undefined);
  const [employeeToReplace, setEmployeeToReplace] = useState<
    string | undefined
  >(undefined);

  const actingAsEmployee = props.actingAsEmployee;

  const [step, setStep] = useQueryParamIso(StepParams);
  const [state, dispatch] = useReducer(editAbsenceReducer, props, initialState);
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState(false);

  const customizedVacancyDetails = state.customizedVacanciesInput;
  const setVacanciesInput = useCallback(
    (input: VacancyDetail[] | undefined) => {
      dispatch({ action: "setVacanciesInput", input });
    },
    [dispatch]
  );
  const resetInitialAbsenceState = useCallback(
    (initialState: EditAbsenceState) => {
      dispatch({ action: "resetToInitialState", initialState });
    },
    [dispatch]
  );

  const [assignVacancy] = useMutationBundle(AssignVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const employeeName = `${props.firstName} ${props.lastName}`;
  const canEdit =
    !actingAsEmployee ||
    (!props.replacementEmployeeId && !some(props.absenceDates, isPast));

  const initialFormData: EditAbsenceFormData = {
    absenceReason: props.absenceReason.id.toString(),
    dayPart: props.dayPart,
    payCode:
      // @ts-ignore
      props.initialVacancies[0]?.details[0]?.payCodeId?.toString() ?? undefined,
    accountingCode:
      // @ts-ignore
      props.initialVacancies[0]?.details[0]?.accountingCodeAllocations[0]?.accountingCode?.id?.toString() ??
      undefined,
    hourlyStartTime:
      props.dayPart === DayPart.Hourly
        ? parseISO(props.startTimeLocal)
        : undefined,
    hourlyEndTime:
      props.dayPart === DayPart.Hourly
        ? parseISO(props.endTimeLocal)
        : undefined,
    notesToReplacement:
      props.initialVacancies[0]?.notesToReplacement ?? undefined,
    notesToApprover: props.notesToApprover,
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    errors,
    triggerValidation,
    formState,
  } = useForm<EditAbsenceFormData>({
    defaultValues: initialFormData,
  });

  const formValues = getValues();
  const required = t("Required");
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "absenceReason", type: "custom" }, { required });
  register({ name: "needsReplacement", type: "custom" });
  register({ name: "notesToApprover", type: "custom" });
  register({ name: "notesToReplacement", type: "custom" });
  register(
    { name: "hourlyStartTime", type: "custom" },
    {
      validate: value =>
        formValues.dayPart !== DayPart.Hourly ||
        value ||
        t("Start time is required"),
    }
  );
  register(
    { name: "hourlyEndTime", type: "custom" },
    {
      validate: value =>
        formValues.dayPart !== DayPart.Hourly ||
        value ||
        t("End time is required"),
    }
  );
  register({ name: "accountingCode", type: "custom" });
  register({ name: "payCode", type: "custom" });

  const [updateAbsence] = useMutationBundle(UpdateAbsence, {
    onError: error => {
      ShowIgnoreAndContinueOrError(
        error,
        openDialog,
        t("There was an issue updating the absence"),
        async () => await update(formValues, true),
        t,
        TranslateAbsenceErrorCodeToMessage
      );
    },
    refetchQueries: ["GetAbsence"],
  });

  const useProjectedInformation =
    customizedVacancyDetails !== undefined ||
    !isEqual(state.absenceDates, props.absenceDates) ||
    formValues.dayPart !== props.dayPart ||
    state.needsReplacement !== props.initialVacancies.length > 0;

  const disabledDatesQuery = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );

  /* We are going to presume that any dates that exist within the original absence
     can still be selected, regardless of why they may presently exist in the disabledDates.
     (hopefully this is simply because the absence itself exists)
   */
  const disabledDates = useMemo(() => {
    const absenceDays = Object.keys(props.absenceDetailsIdsByDate).map(d =>
      parseISO(d)
    );

    return differenceWith(
      getCannotCreateAbsenceDates(disabledDatesQuery),
      absenceDays,
      isSameDay
    );
  }, [disabledDatesQuery, props.absenceDetailsIdsByDate]);

  React.useEffect(() => {
    const conflictingDates = disabledDates.filter(dis =>
      some(state.absenceDates, ad => isSameDay(ad, dis))
    );
    if (conflictingDates.length > 0) {
      dispatch({ action: "removeAbsenceDates", dates: conflictingDates });
    }
  }, [disabledDates, state.absenceDates]);

  const projectedVacanciesInput = useMemo(
    () =>
      buildAbsenceCreateInput(
        state.absenceDates,
        formValues,
        props.organizationId,
        state.employeeId,
        props.positionId ?? "",
        disabledDates,
        state.needsReplacement,
        true,
        customizedVacancyDetails
      ),
    [
      state.absenceDates,
      state.employeeId,
      state.needsReplacement,
      formValues,
      props.organizationId,
      props.positionId,
      disabledDates,
      customizedVacancyDetails,
    ]
  );

  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: {
        ...projectedVacanciesInput!,
        ignoreWarnings: true,
      },
      ignoreAbsenceId: props.absenceId,
    },
    skip: !useProjectedInformation || projectedVacanciesInput === null,
    onError: () => {},
  });

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: {
        ...projectedVacanciesInput!,
        ignoreWarnings: true,
      },
      ignoreAbsenceId: props.absenceId,
    },
    skip: !useProjectedInformation || projectedVacanciesInput === null,
    // fetchPolicy: "no-cache",
    onError: () => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const trackingBalanceReasonIds = props.trackingBalanceReasonIds;
  const initialAbsenceUsageData = props.initialAbsenceUsageData;
  const projectedAbsenceUsage =
    getProjectedAbsenceUsage.state === "DONE" ||
    getProjectedAbsenceUsage.state === "UPDATING"
      ? compact(
          flatMap(
            getProjectedAbsenceUsage.data.absence?.projectedAbsence?.details,
            d => d?.reasonUsages?.map(ru => ru)
          )
        )
      : [];

  const absenceUsageText = useMemo(() => {
    if (projectedAbsenceUsage.length > 0) {
      return computeAbsenceUsageText(
        projectedAbsenceUsage as any,
        trackingBalanceReasonIds,
        t,
        actingAsEmployee
      );
    } else {
      return computeAbsenceUsageText(
        initialAbsenceUsageData,
        trackingBalanceReasonIds,
        t,
        actingAsEmployee
      );
    }
  }, [
    projectedAbsenceUsage,
    trackingBalanceReasonIds,
    initialAbsenceUsageData,
    t,
    actingAsEmployee,
  ]);

  const projectedVacancies =
    getProjectedVacancies.state === "DONE" ||
    getProjectedVacancies.state === "UPDATING"
      ? (compact(
          getProjectedVacancies.data?.absence?.projectedVacancies ?? []
        ) as Vacancy[])
      : null;

  const onChangedVacancies = useCallback(
    (vacancyDetails: VacancyDetail[]) => {
      setStep("absence");
      setVacanciesInput(vacancyDetails);
    },
    [setVacanciesInput, setStep]
  );
  const onCancel = () => setStep("absence");

  const projectedVacancyDetails: VacancyDetail[] = useMemo(() => {
    const projectedDetails = projectVacancyDetails(getProjectedVacancies);
    if (props.assignmentsByDate.length > 0) {
      projectedDetails
        .filter(d => !d.assignmentId)
        .forEach(d => {
          // Find a matching record in assignmentsByDate
          const match = props.assignmentsByDate.find(a => a.date === d.date);
          if (match) {
            d.assignmentId = match.assignmentId;
            d.assignmentRowVersion = match.assignmentRowVersion;
            d.assignmentStartDateTime = match.assignmentStartDateTime;
            d.assignmentEmployeeId = match.assignmentEmployeeId;
            d.assignmentEmployeeFirstName = match.assignmentEmployeeFirstName;
            d.assignmentEmployeeLastName = match.assignmentEmployeeLastName;
          }
        });
    }
    return projectedDetails;
  }, [getProjectedVacancies, props.assignmentsByDate]);

  const theVacancyDetails: VacancyDetail[] =
    customizedVacancyDetails ||
    (useProjectedInformation && projectedVacancyDetails) ||
    props.initialVacancyDetails;

  const update = async (
    data: EditAbsenceFormData,
    ignoreWarnings?: boolean
  ) => {
    let absenceUpdateInput = buildAbsenceUpdateInput(
      props.absenceId,
      props.positionId ?? "",
      props.rowVersion,
      state.absenceDates,
      props.absenceDetailsIdsByDate,
      data,
      disabledDates,
      state,
      theVacancyDetails
    );

    if (ignoreWarnings) {
      absenceUpdateInput = {
        ...absenceUpdateInput,
        ignoreWarnings: true,
      };
    }

    const result = await updateAbsence({
      variables: { absence: absenceUpdateInput },
    });

    const absence = result?.data?.absence?.update as Absence;
    if (absence) {
      // Reset the form so it's no longer dirty
      reset();
      openSnackbar({
        message: props.returnUrl
          ? t("Absence #{{absenceId}} has been updated", {
              absenceId: absence.id,
            })
          : t("The absence has been updated"),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
    }
  };

  const onAssignReplacement = useCallback(
    async (
      employeeId: string,
      employeeFirstName: string,
      employeeLastName: string,
      payCode: string | undefined,
      vacancyDetailIds?: string[]
    ) => {
      if (props.replacementEmployeeId != undefined) {
        await props.cancelAssignments(
          undefined,
          undefined,
          vacancyDetailIds,
          true
        );
      }

      await assignVacancy({
        variables: {
          assignment: {
            orgId: props.organizationId,
            employeeId: employeeId,
            appliesToAllVacancyDetails:
              !vacancyDetailIds || vacancyDetailIds.length === 0,
            vacancyDetailIds:
              vacancyDetailIds && vacancyDetailIds.length > 0
                ? vacancyDetailIds
                : undefined,
            vacancyId: props.initialVacancies[0].id,
            ignoreWarnings: true,
          },
        },
      });

      await props.refetchAbsence();
      setStep("absence");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props, assignVacancy, setStep]
  );

  const onToggleAbsenceDate = useCallback(
    (d: Date) => {
      if (canEdit) dispatch({ action: "toggleDate", date: d });
    },
    [dispatch, canEdit]
  );

  const onClickReset = () => {
    setCancelDialogIsOpen(true);
  };

  const handleReset = () => {
    // Reset the form
    reset(initialFormData);
    // Reset all of the details in State
    resetInitialAbsenceState(initialState(props));
    setCancelDialogIsOpen(false);
  };

  const onAssignSubClick = React.useCallback(
    (vacancyDetailIds?: string[], employeeToReplace?: string) => {
      setVacancyDetailIdsToAssign(vacancyDetailIds ?? undefined);
      setEmployeeToReplace(employeeToReplace ?? undefined);
      setStep("preAssignSub");
    },
    [setStep]
  );

  const hasUnsavedChanges = useMemo(() => {
    return (
      formState.dirty ||
      !isEqual(state.absenceDates, props.absenceDates) ||
      !isEqual(props.initialVacancyDetails, theVacancyDetails)
    );
  }, [
    formState.dirty,
    state.absenceDates,
    props.absenceDates,
    props.initialVacancyDetails,
    theVacancyDetails,
  ]);

  return (
    <>
      <DiscardChangesDialog
        onCancel={() => handleReset()}
        onClose={() => setCancelDialogIsOpen(false)}
        open={cancelDialogIsOpen}
      />
      {props.returnUrl && (
        <div className={classes.linkPadding}>
          <Link to={props.returnUrl} className={classes.link}>
            {t("Return to previous page")}
          </Link>
        </div>
      )}
      <PageTitle title={t("Edit Absence")} withoutHeading />
      <Prompt
        message={location => {
          if (match.url === location.pathname || !hasUnsavedChanges) {
            // We're not actually leaving the Edit Absence route
            // OR we don't have any pending changes
            return true;
          }

          const msg = t(
            "Click DISCARD CHANGES to leave this page and lose all unsaved changes."
          );
          return msg;
        }}
      />

      {step === "absence" && (
        <form
          id="absence-form"
          onSubmit={handleSubmit(async data => {
            await update(data);
            dispatch({ action: "resetAfterSave" });
          })}
        >
          <div className={classes.titleContainer}>
            <AbsenceVacancyHeader
              subHeader={employeeName}
              pageHeader={`${t("Edit absence")} #${props.absenceId}`}
              actingAsEmployee={props.actingAsEmployee}
            />
            <div className={classes.headerMenu}>
              <ActionMenu
                className={classes.actionMenu}
                options={[
                  {
                    name: t("Activity Log"),
                    onClick: () => {
                      history.push(
                        AbsenceActivityLogRoute.generate({
                          organizationId: props.organizationId,
                          absenceId: props.absenceId,
                        })
                      );
                    },
                    permissions: (
                      permissions: OrgUserPermissions[],
                      isSysAdmin: boolean,
                      orgId?: string
                    ) => canViewAsSysAdmin(permissions, isSysAdmin, orgId),
                  },
                  {
                    name: t("Notification Log"),
                    onClick: () => {
                      history.push(
                        VacancyNotificationLogRoute.generate({
                          organizationId: props.organizationId,
                          vacancyId: props.initialVacancies[0].id,
                          absenceId: props.absenceId,
                        })
                      );
                    },
                    permissions: [PermissionEnum.AbsVacViewNotificationLog],
                  },
                ]}
              />
            </div>
          </div>

          <Section className={classes.absenceDetails}>
            <AbsenceDetails
              absenceDates={state.absenceDates}
              onToggleAbsenceDate={onToggleAbsenceDate}
              saveLabel={t("Save")}
              setStep={setStep}
              assignmentId={props.assignmentId}
              disabledDates={disabledDates}
              isAdmin={props.userIsAdmin}
              needsReplacement={props.needsReplacement}
              wantsReplacement={state.needsReplacement}
              organizationId={props.organizationId}
              employeeId={props.employeeId}
              currentMonth={state.viewingCalendarMonth}
              onSwitchMonth={d => dispatch({ action: "switchMonth", month: d })}
              onSubstituteWantedChange={subWanted =>
                dispatch({ action: "setNeedsReplacement", to: subWanted })
              }
              values={formValues}
              setValue={setValue}
              absenceReason={props.absenceReason}
              errors={{}}
              triggerValidation={triggerValidation}
              vacancies={projectedVacancies || props.initialVacancies}
              vacancyDetails={theVacancyDetails}
              balanceUsageText={absenceUsageText ?? undefined}
              setVacanciesInput={setVacanciesInput}
              arrangedSubText={t("assigned")}
              arrangeSubButtonTitle={t("Assign Sub")}
              disableReplacementInteractions={useProjectedInformation}
              disableEditingDatesAndTimes={!canEdit}
              replacementEmployeeId={props.replacementEmployeeId}
              replacementEmployeeName={props.replacementEmployeeName}
              onRemoveReplacement={props.cancelAssignments}
              locationIds={props.locationIds}
              returnUrl={props.returnUrl}
              isSubmitted={formState.isSubmitted}
              initialAbsenceCreation={false}
              onDelete={props.onDelete}
              onCancel={onClickReset}
              onAssignSubClick={onAssignSubClick}
              isFormDirty={
                formState.dirty ||
                !isEqual(state.absenceDates, props.absenceDates) ||
                !isEqual(props.initialVacancyDetails, theVacancyDetails)
              }
              hasEditedDetails={true}
              assignmentsByDate={props.assignmentsByDate}
            />
          </Section>
        </form>
      )}
      {step === "edit" && (
        <EditVacancies
          orgId={props.organizationId}
          actingAsEmployee={actingAsEmployee}
          absenceId={props.absenceId}
          employeeName={employeeName}
          positionName={props.positionName}
          onCancel={onCancel}
          details={theVacancyDetails}
          onChangedVacancies={onChangedVacancies}
          employeeId={props.employeeId}
          setStep={setStep}
          disabledDates={disabledDates}
        />
      )}
      {step === "preAssignSub" && (
        <AssignSub
          existingVacancy
          employeeName={employeeName}
          absenceId={props.absenceId}
          orgId={props.organizationId}
          vacancies={projectedVacancies || props.initialVacancies}
          userIsAdmin={!actingAsEmployee && props.userIsAdmin}
          employeeId={props.employeeId}
          positionId={props.positionId}
          positionName={props.positionName}
          disabledDates={disabledDates}
          selectButtonText={t("Assign")}
          onAssignReplacement={onAssignReplacement}
          onCancel={() => {
            setVacancyDetailIdsToAssign(undefined);
            setEmployeeToReplace(undefined);
            onCancel();
          }}
          employeeToReplace={employeeToReplace}
          vacancyDetailIdsToAssign={vacancyDetailIdsToAssign}
          assignmentsByDate={props.assignmentsByDate}
        />
      )}
    </>
  );
};

const initialState = (props: Props): EditAbsenceState => ({
  employeeId: props.employeeId,
  absenceId: props.absenceId,
  viewingCalendarMonth: startOfMonth(props.absenceDates[0]),
  needsReplacement: props.needsReplacement !== NeedsReplacement.No,
  absenceDates: props.absenceDates,
  customizedVacanciesInput: undefined,
});

const buildAbsenceUpdateInput = (
  absenceId: string,
  positionId: string,
  rowVersion: string,
  absenceDates: Date[],
  absenceDetailsIdsByDate: Record<string, string>,
  formValues: EditAbsenceFormData,
  disabledDates: Date[],
  state: EditAbsenceState,
  vacancyDetails: VacancyDetail[]
): AbsenceUpdateInput => {
  if (absenceDates.length < 1) {
    throw Error("no dates selected");
  }

  const dates = differenceWith(absenceDates, disabledDates, (a, b) =>
    isSameDay(a, b)
  );

  // If the Vacancy Details records have selections, we don't want to send
  // the associated property on the parent Vacancy to the server.
  const detailsHaveDifferentAccountingCodeSelections = vacancyDetailsHaveDifferentAccountingCodeSelections(
    vacancyDetails,
    formValues.accountingCode ? formValues.accountingCode : null
  );
  const detailsHaveDifferentPayCodeSelections = vacancyDetailsHaveDifferentPayCodeSelections(
    vacancyDetails,
    formValues.payCode ? formValues.payCode : null
  );

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
      // If any of the Details have Pay Codes selected we'll include those selections
      // here on the detail or send null when one doesn't have any Pay Code selected
      payCodeId: !detailsHaveDifferentPayCodeSelections
        ? undefined
        : v.payCodeId
        ? v.payCodeId
        : null,
      // If any of the Details have Accounting Codes selected we'll include those selections
      // here on the detail or send null when one doesn't have any Accounting Code selected
      accountingCodeAllocations: !detailsHaveDifferentAccountingCodeSelections
        ? undefined
        : v.accountingCodeId
        ? [{ accountingCodeId: v.accountingCodeId, allocation: 1 }]
        : [],
    })) || undefined;

  const absence: AbsenceUpdateInput = {
    id: absenceId,
    rowVersion,
    notesToApprover: formValues.notesToApprover,
    details: dates.map(d => {
      const formattedDate = formatISO(d, { representation: "date" });
      const previousId = absenceDetailsIdsByDate[formattedDate];
      let detail: AbsenceDetailCreateInput = {
        date: formattedDate,
        id: previousId ? previousId : null,
        dayPartId: formValues.dayPart,
        reasons: [{ absenceReasonId: formValues.absenceReason }],
      };

      if (formValues.dayPart === DayPart.Hourly) {
        detail = {
          ...detail,
          startTime: secondsSinceMidnight(
            parseTimeFromString(format(formValues.hourlyStartTime!, "h:mm a"))
          ),
          endTime: secondsSinceMidnight(
            parseTimeFromString(format(formValues.hourlyEndTime!, "h:mm a"))
          ),
        };
      }

      return detail;
    }),
    vacancies: [
      {
        positionId: positionId,
        useSuppliedDetails: true,
        needsReplacement: state.needsReplacement,
        notesToReplacement: formValues.notesToReplacement,
        prearrangedReplacementEmployeeId: null, // TODO make this the currently assigned employee
        details: vDetails,
        // When the details have Accounting Code selections, we won't send Accounting Codes on
        // the Vacancy. When they don't we'll take the single selection in Sub Details
        // and send that if there is one or an empty list to clear out all selections on the Details.
        accountingCodeAllocations: detailsHaveDifferentAccountingCodeSelections
          ? undefined
          : formValues.accountingCode
          ? [
              {
                accountingCodeId: formValues.accountingCode,
                allocation: 1.0,
              },
            ]
          : [],
        // When the details have Pay Code selections, we won't send a Pay Code on
        // the Vacancy. When they don't we'll take the single selection in Sub Details
        // and send that if there is one or null to clear out all selections on the Details.
        payCodeId: detailsHaveDifferentPayCodeSelections
          ? undefined
          : formValues.payCode
          ? formValues.payCode
          : null,
      },
    ],
  };

  return absence;
};

const useStyles = makeStyles(theme => ({
  absenceDetails: {
    marginTop: theme.spacing(3),
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignText: "center",
    justifyContent: "space-between",
  },
  title: { flexGrow: 1 },
  confirmationNumber: {},
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
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    paddingBottom: theme.typography.pxToRem(15),
  },
}));
