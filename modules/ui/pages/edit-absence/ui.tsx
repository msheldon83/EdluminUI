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
} from "ui/components/absence/helpers";
import { ActionMenu } from "ui/components/action-menu";
import { ShowIgnoreAndContinueOrError } from "ui/components/error-helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { VacancyDetail } from "../../components/absence/types";
import { AssignSub } from "../create-absence/assign-sub";
import { EditVacancies } from "../create-absence/edit-vacancies";
import { GetProjectedAbsenceUsage } from "../create-absence/graphql/get-projected-absence-usage.gen";
import { GetProjectedVacancies } from "../create-absence/graphql/get-projected-vacancies.gen";
import { projectVacancyDetails } from "../create-absence/project-vacancy-details";
import { buildAbsenceCreateInput } from "../create-absence/ui";
import { AssignVacancy } from "./graphql/assign-vacancy.gen";
import { UpdateAbsence } from "./graphql/update-absence.gen";
import { editAbsenceReducer, EditAbsenceState } from "./state";
import { StepParams } from "./step-params";

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
  absenceReasonId: string;
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
  onCancel: () => void;
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
  const [vacancyDetailIdsToAssign, setVacancyDetailIdsToAssign] = useState<
    string[] | undefined
  >(undefined);
  const [employeeToReplace, setEmployeeToReplace] = useState<
    string | undefined
  >(undefined);

  const [step, setStep] = useQueryParamIso(StepParams);
  const [state, dispatch] = useReducer(editAbsenceReducer, props, initialState);

  const customizedVacancyDetails = state.customizedVacanciesInput;
  const setVacanciesInput = useCallback(
    (input: VacancyDetail[] | undefined) => {
      dispatch({ action: "setVacanciesInput", input });
    },
    [dispatch]
  );

  const [assignVacancy] = useMutationBundle(AssignVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const name = `${props.firstName} ${props.lastName}`;
  const canEdit =
    !props.actingAsEmployee ||
    (!props.replacementEmployeeId && !some(props.absenceDates, isPast));

  const initialFormData: EditAbsenceFormData = {
    absenceReason: props.absenceReasonId.toString(),
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
  }, [disabledDates]);

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
        customizedVacancyDetails
      ),
    [
      props.organizationId,
      state.absenceDates,
      formValues.absenceReason,
      formValues.dayPart,
      formValues.hourlyStartTime,
      formValues.hourlyEndTime,
      customizedVacancyDetails,
      state,
      props.positionId,
      disabledDates,
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

  const absenceUsageText = useMemo(() => {
    if (
      getProjectedAbsenceUsage.state === "DONE" ||
      getProjectedAbsenceUsage.state === "UPDATING"
    ) {
      const usages = compact(
        flatMap(
          getProjectedAbsenceUsage.data.absence?.projectedAbsence?.details,
          d => d?.reasonUsages?.map(ru => ru)
        )
      );
      return computeAbsenceUsageText(usages as any, t);
    } else {
      return computeAbsenceUsageText(props.initialAbsenceUsageData, t);
    }
  }, [props.initialAbsenceUsageData, t, getProjectedAbsenceUsage]);

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
  const onCancel = useCallback(() => setStep("absence"), [setStep]);

  const projectedVacancyDetails: VacancyDetail[] = useMemo(
    () => projectVacancyDetails(getProjectedVacancies),
    [projectVacancyDetails, getProjectedVacancies.state]
  );

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

  const onSelectReplacement = useCallback(
    async (
      employeeId: string,
      name: string,
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
    [setStep, assignVacancy]
  );

  const onToggleAbsenceDate = useCallback(
    (d: Date) => {
      if (canEdit) dispatch({ action: "toggleDate", date: d });
    },
    [dispatch, canEdit]
  );

  const onAssignSubClick = React.useCallback(
    (vacancyDetailIds?: string[], employeeToReplace?: string) => {
      setVacancyDetailIdsToAssign(vacancyDetailIds ?? undefined);
      setEmployeeToReplace(employeeToReplace ?? undefined);
      setStep("preAssignSub");
    },
    [setStep]
  );

  return (
    <>
      {props.returnUrl && (
        <div className={classes.linkPadding}>
          <Link to={props.returnUrl} className={classes.link}>
            {t("Return to previous page")}
          </Link>
        </div>
      )}
      <PageTitle title={t("Edit Absence")} withoutHeading />

      {step === "absence" && (
        <form
          onSubmit={handleSubmit(async data => {
            await update(data);
            dispatch({ action: "resetAfterSave" });
          })}
        >
          <div className={classes.titleContainer}>
            <div className={classes.title}>
              {props.actingAsEmployee ? (
                <Typography variant="h1">{t("Edit absence")}</Typography>
              ) : (
                <>
                  <Typography variant="h5">{t("Edit absence")}</Typography>
                  <Typography variant="h1">{name}</Typography>
                </>
              )}
            </div>

            <div className={classes.headerMenu}>
              <ActionMenu
                className={classes.actionMenu}
                options={[
                  {
                    name: t("Delete"),
                    onClick: () => props.onDelete(),
                    permissions: [PermissionEnum.AbsVacDelete],
                  },
                ]}
              />

              <div className={classes.confirmationNumber}>
                <Typography variant="h6">
                  {t("Confirmation")} #{props.absenceId}
                </Typography>
              </div>
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
              errors={{}}
              triggerValidation={triggerValidation}
              vacancies={projectedVacancies || props.initialVacancies}
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
              onCancel={props.onCancel}
              onAssignSubClick={onAssignSubClick}
            />
          </Section>
        </form>
      )}
      {step === "edit" && (
        <EditVacancies
          orgId={props.organizationId}
          actingAsEmployee={props.actingAsEmployee}
          employeeName={name}
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
          employeeName={name}
          orgId={props.organizationId}
          absenceId={props.absenceId}
          vacancies={projectedVacancies || props.initialVacancies}
          userIsAdmin={!props.actingAsEmployee && props.userIsAdmin}
          employeeId={props.employeeId}
          positionId={props.positionId}
          positionName={props.positionName}
          disabledDates={disabledDates}
          selectButtonText={t("Assign")}
          onSelectReplacement={onSelectReplacement}
          onCancel={() => {
            setVacancyDetailIdsToAssign(undefined);
            setEmployeeToReplace(undefined);
            onCancel();
          }}
          employeeToReplace={employeeToReplace}
          vacancyDetailIdsToAssign={vacancyDetailIdsToAssign}
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
      payCodeId: v.payCodeId,
      accountingCodeAllocations: v.accountingCodeId
        ? [{ accountingCodeId: v.accountingCodeId, allocation: 1 }]
        : undefined,
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
        accountingCodeAllocations: formValues.accountingCode
          ? [
              {
                accountingCodeId: formValues.accountingCode,
                allocation: 1.0,
              },
            ]
          : undefined,
        payCodeId: formValues.payCode ? formValues.payCode : undefined,
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
    alignItems: "flex-end",
  },
  title: { flexGrow: 1 },
  confirmationNumber: {},
  headerMenu: {
    display: "flex",
    flexDirection: "column",
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
