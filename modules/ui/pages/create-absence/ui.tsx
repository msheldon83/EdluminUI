/* eslint-disable react-hooks/exhaustive-deps */
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { format, isBefore, isSameDay, startOfMonth } from "date-fns";
import { useForm } from "forms";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  Absence,
  AbsenceCreateInput,
  AbsenceVacancyInput,
  DayPart,
  NeedsReplacement,
  Vacancy,
} from "graphql/server-types.gen";
import { computeAbsenceUsageText } from "helpers/absence/computeAbsenceUsageText";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { convertStringToDate } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useQueryParamIso } from "hooks/query-params";
import { useSnackbar } from "hooks/use-snackbar";
import { compact, flatMap, size, some } from "lodash-es";
import * as React from "react";
import { useCallback, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { AbsenceDetails } from "ui/components/absence/absence-details";
import {
  createAbsenceDetailInput,
  getAbsenceDates,
  getCannotCreateAbsenceDates,
  vacancyDetailsHaveDifferentAccountingCodeSelections,
  vacancyDetailsHaveDifferentPayCodeSelections,
} from "ui/components/absence/helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { ErrorBanner } from "ui/components/error-banner";
import { VacancyDetail } from "../../components/absence/types";
import { AssignSub } from "./assign-sub/index";
import { Confirmation } from "./confirmation";
import { EditVacancies } from "./edit-vacancies";
import { CreateAbsence } from "./graphql/create.gen";
import { GetProjectedAbsenceUsage } from "./graphql/get-projected-absence-usage.gen";
import { GetProjectedVacancies } from "./graphql/get-projected-vacancies.gen";
import { projectVacancyDetails } from "./project-vacancy-details";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { StepParams } from "./step-params";
import { ApolloError } from "apollo-client";
import { Prompt, useRouteMatch } from "react-router";

type Props = {
  firstName: string;
  lastName: string;
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
  needsReplacement: NeedsReplacement;
  userIsAdmin: boolean;
  positionId?: string;
  positionName?: string;
  locationIds?: string[];
  initialAbsenceReason?: string;
  initialDates?: Date[];
  initialDayPart?: DayPart;
  initialStartHour?: Date;
  initialEndHour?: Date;
  initialNeedsReplacement?: boolean;
  payCodeId?: string | null;
  accountingCodeId?: string | null;
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [absence, setAbsence] = useState<Absence>();
  const [step, setStep] = useQueryParamIso(StepParams);
  const match = useRouteMatch();

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );

  const setVacanciesInput: (
    i: undefined | VacancyDetail[]
  ) => void = useCallback(
    i =>
      dispatch({
        action: "setVacanciesInput",
        input: i,
      }),
    [dispatch]
  );
  const initialFormData: CreateAbsenceFormData = {
    absenceReason: props.initialAbsenceReason || "",
    dayPart: props.initialDayPart,
    hourlyStartTime: props.initialStartHour,
    hourlyEndTime: props.initialEndHour,
    payCode: props.payCodeId ?? undefined,
    accountingCode: props.accountingCodeId ?? undefined,
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    triggerValidation,
    formState,
  } = useForm<CreateAbsenceFormData>({
    defaultValues: initialFormData,
  });

  const snackbar = useSnackbar();
  /* only show the form error once. this prevents it from reappearing as the user edits individual fields */
  const formErrorShown = React.useRef(false);
  React.useEffect(() => {
    if (size(errors) > 0 && !formErrorShown.current) {
      formErrorShown.current = true;
      snackbar.openSnackbar({
        message: t("Some fields are missing or invalid."),
        autoHideDuration: 5000,
        dismissable: true,
        status: "error",
      });
    }
  }, [t, errors, snackbar, formErrorShown]);

  const [errorBannerOpen, setErrorBannerOpen] = useState(false);
  const [absenceErrors, setAbsenceErrors] = useState<ApolloError | null>(null);
  const [abscenceCreated, setAbsenceCreated] = useState(false);

  const formValues = getValues();

  const [createAbsence] = useMutationBundle(CreateAbsence, {
    onError: error => {
      setAbsenceErrors(error);
      setErrorBannerOpen(true);
    },
  });

  const required = t("Required");
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "absenceReason", type: "custom" }, { required });
  register({ name: "needsReplacement", type: "custom" });
  register({ name: "notesToApprover", type: "custom" });
  register({ name: "notesToReplacement", type: "custom" });
  register({ name: "replacementEmployeeId", type: "custom" });
  register({ name: "replacementEmployeeName", type: "custom" });
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

  const disabledDatesObjs = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );
  const disabledDates = useMemo(
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
  }, [disabledDates]);

  const projectedVacanciesInput = useMemo(
    () =>
      buildAbsenceCreateInput(
        state.absenceDates,
        formValues,
        state.organizationId,
        state.employeeId,
        props.positionId ?? "",
        disabledDates,
        state.needsReplacement,
        !!state.vacanciesInput,
        state.vacanciesInput
      ),
    [
      state.absenceDates,
      formValues.absenceReason,
      formValues.dayPart,
      formValues.hourlyStartTime,
      formValues.hourlyEndTime,
      state.vacanciesInput,
      state.needsReplacement,
    ]
  );

  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: {
        ...projectedVacanciesInput!,
        ignoreWarnings: true,
      },
    },
    skip: projectedVacanciesInput === null,
    onError: () => {},
  });

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: {
        ...projectedVacanciesInput!,
        ignoreWarnings: true,
      },
    },
    skip: projectedVacanciesInput === null,
    // fetchPolicy: "no-cache",
    onError: () => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const projectedVacancyDetails: VacancyDetail[] = useMemo(
    () => projectVacancyDetails(getProjectedVacancies),
    [getProjectedVacancies.state]
  );

  const theVacancyDetails: VacancyDetail[] =
    state.vacanciesInput || projectedVacancyDetails;

  const projectedVacancies =
    getProjectedVacancies.state === "LOADING" ||
    getProjectedVacancies.state === "UPDATING"
      ? []
      : (compact(
          getProjectedVacancies.data?.absence?.projectedVacancies ?? []
        ) as Vacancy[]);

  const absenceUsageText = useMemo(() => {
    if (
      !(
        getProjectedAbsenceUsage.state === "DONE" ||
        getProjectedAbsenceUsage.state === "UPDATING"
      )
    )
      return null;

    const usages = compact(
      flatMap(
        getProjectedAbsenceUsage.data.absence?.projectedAbsence?.details,
        d => d?.reasonUsages?.map(ru => ru)
      )
    );
    return computeAbsenceUsageText(usages as any, t);
  }, [getProjectedVacancies]);

  const name = `${props.firstName} ${props.lastName}`;

  const create = async (
    formValues: CreateAbsenceFormData,
    ignoreWarnings?: boolean
  ) => {
    let absenceCreateInput = buildAbsenceCreateInput(
      state.absenceDates,
      formValues,
      state.organizationId,
      state.employeeId,
      props.positionId ?? "",
      disabledDates,
      state.needsReplacement,
      !!state.vacanciesInput,
      theVacancyDetails
    );
    if (!absenceCreateInput) {
      return;
    }

    if (ignoreWarnings) {
      absenceCreateInput = {
        ...absenceCreateInput,
        ignoreWarnings: true,
      };
    }

    const result = await createAbsence({
      variables: {
        absence: absenceCreateInput,
      },
    });

    const absence = result?.data?.absence?.create as Absence;
    if (absence) {
      setAbsence(absence);
      setAbsenceCreated(true);
      setStep("confirmation");
    }
  };

  const onChangedVacancies = React.useCallback(
    (vacancyDetails: VacancyDetail[]) => {
      setStep("absence");
      setVacanciesInput(vacancyDetails);
    },
    [setVacanciesInput, setStep]
  );
  const onCancel = () => setStep("absence");

  const onAssignSub = React.useCallback(
    (
      replacementId: string,
      replacementName: string,
      payCodeId: string | undefined
    ) => {
      /* eslint-disable @typescript-eslint/no-floating-promises */
      setValue("replacementEmployeeId", replacementId);
      setValue("replacementEmployeeName", replacementName);
      if (payCodeId) {
        setValue("payCode", payCodeId);
      }
      /* eslint-enable @typescript-eslint/no-floating-promises */
      setStep("absence");
    },
    [setStep, setValue]
  );
  const onAssignSubClick = React.useCallback(() => setStep("preAssignSub"), [
    setStep,
  ]);

  const removePrearrangedReplacementEmployee = React.useCallback(async () => {
    await setValue("replacementEmployeeId", undefined);
    await setValue("replacementEmployeeName", undefined);
  }, [setValue]);

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />
      <Prompt
        message={location => {
          if (match.url === location.pathname || abscenceCreated) {
            // We're not actually leaving the Create Absence route
            // OR the Absence has been created and we're on the Confirmation screen
            return true;
          }

          const msg = t(
            "You have not created your absence yet. Click DISCARD CHANGES to leave this page and lose all unsaved changes."
          );
          return msg;
        }}
      />

      <form
        onSubmit={handleSubmit(async data => {
          await create(data);
        })}
      >
        {step === "absence" && (
          <>
            {props.actingAsEmployee ? (
              <Typography variant="h1">{t("Create absence")}</Typography>
            ) : (
              <>
                <Typography variant="h5">{t("Create absence")}</Typography>
                <Typography variant="h1">{name}</Typography>
              </>
            )}
            <Section className={classes.absenceDetails}>
              <ErrorBanner
                errorBannerOpen={errorBannerOpen}
                title={t("There was an issue creating the absence")}
                apolloErrors={absenceErrors}
                setErrorBannerOpen={setErrorBannerOpen}
                continueAction={async () => await create(formValues, true)}
              />
              <AbsenceDetails
                currentMonth={state.viewingCalendarMonth}
                onSwitchMonth={d =>
                  dispatch({ action: "switchMonth", month: d })
                }
                wantsReplacement={state.needsReplacement}
                onSubstituteWantedChange={subWanted =>
                  dispatch({ action: "setNeedsReplacement", to: subWanted })
                }
                organizationId={props.organizationId}
                employeeId={state.employeeId}
                setValue={setValue}
                absenceDates={state.absenceDates}
                onToggleAbsenceDate={d =>
                  dispatch({ action: "toggleDate", date: d })
                }
                values={formValues}
                errors={errors}
                triggerValidation={triggerValidation}
                isAdmin={props.userIsAdmin}
                needsReplacement={props.needsReplacement}
                vacancies={projectedVacancies}
                setStep={setStep}
                vacancyDetails={projectedVacancyDetails}
                locationIds={props.locationIds}
                disabledDates={disabledDates}
                balanceUsageText={absenceUsageText || undefined}
                setVacanciesInput={setVacanciesInput}
                replacementEmployeeId={formValues.replacementEmployeeId}
                replacementEmployeeName={formValues.replacementEmployeeName}
                onRemoveReplacement={removePrearrangedReplacementEmployee}
                isSubmitted={formState.isSubmitted}
                initialAbsenceCreation={true}
                isFormDirty={formState.dirty}
                onAssignSubClick={onAssignSubClick}
                hasEditedDetails={!!state.vacanciesInput}
              />
            </Section>
          </>
        )}
        {step === "preAssignSub" && (
          <AssignSub
            orgId={props.organizationId}
            userIsAdmin={!props.actingAsEmployee && props.userIsAdmin}
            employeeName={name}
            employeeId={state.employeeId}
            positionId={props.positionId}
            positionName={props.positionName}
            vacancies={projectedVacancies}
            disabledDates={disabledDates}
            onCancel={onCancel}
            onSelectReplacement={onAssignSub}
          />
        )}
        {step === "confirmation" && (
          <Confirmation
            orgId={props.organizationId}
            absence={absence}
            setStep={setStep}
            isAdmin={props.userIsAdmin}
          />
        )}
      </form>
      {step === "edit" && (
        <EditVacancies
          orgId={props.organizationId}
          actingAsEmployee={props.actingAsEmployee}
          employeeName={name}
          positionName={props.positionName}
          onCancel={onCancel}
          details={projectedVacancyDetails}
          onChangedVacancies={onChangedVacancies}
          employeeId={props.employeeId}
          setStep={setStep}
          disabledDates={disabledDates}
          defaultAccountingCode={formValues.accountingCode}
          defaultPayCode={formValues.payCode}
        />
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subtitle: {
    fontSize: theme.typography.pxToRem(24),
  },
  absenceDetails: {
    marginTop: theme.spacing(3),
  },
}));

const initialState = (props: Props): CreateAbsenceState => {
  const needsReplacement =
    props.initialNeedsReplacement === undefined
      ? props.needsReplacement !== NeedsReplacement.No
      : props.initialNeedsReplacement;
  const absenceDates = props.initialDates || [];
  const viewingCalendarMonth = props.initialDates
    ? startOfMonth(props.initialDates[0])
    : startOfMonth(new Date());
  return {
    employeeId: props.employeeId,
    organizationId: props.organizationId,
    viewingCalendarMonth,
    needsReplacement,
    absenceDates,
  };
};

export type CreateAbsenceFormData = {
  absenceReason: string;
  dayPart?: DayPart;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  notesToApprover?: string;
  notesToReplacement?: string;
  replacementEmployeeId?: string;
  replacementEmployeeName?: string;
  vacancies?: AbsenceVacancyInput[];
  accountingCode?: string;
  payCode?: string;
};

export const buildAbsenceCreateInput = (
  absenceDates: Date[],
  formValues: CreateAbsenceFormData,
  organizationId: string,
  employeeId: string,
  positionId: string,
  disabledDates: Date[],
  needsReplacement: boolean,
  hasEditedDetails: boolean,
  vacancyDetails?: VacancyDetail[]
): AbsenceCreateInput | null => {
  if (!formValues.absenceReason || !formValues.dayPart) {
    return null;
  }
  const dates = getAbsenceDates(absenceDates, disabledDates);

  if (!dates) return null;

  // Must have a start and end time if Hourly
  if (
    formValues.dayPart === DayPart.Hourly &&
    (!formValues.hourlyStartTime ||
      !formValues.hourlyEndTime ||
      isBefore(formValues.hourlyEndTime, formValues.hourlyStartTime))
  ) {
    return null;
  }

  let absence: AbsenceCreateInput = {
    orgId: organizationId,
    employeeId: employeeId,
    notesToApprover: formValues.notesToApprover,
    details: createAbsenceDetailInput(
      dates,
      formValues.absenceReason,
      formValues.dayPart,
      formValues.hourlyStartTime,
      formValues.hourlyEndTime
    ),
  };

  // If the Vacancy Details records have selections, we don't want to send
  // the associated property on the parent Vacancy to the server.
  const detailsHaveDifferentAccountingCodeSelections =
    hasEditedDetails &&
    vacancyDetails &&
    vacancyDetailsHaveDifferentAccountingCodeSelections(
      vacancyDetails,
      formValues.accountingCode ? formValues.accountingCode : null
    );
  const detailsHaveDifferentPayCodeSelections =
    hasEditedDetails &&
    vacancyDetails &&
    vacancyDetailsHaveDifferentPayCodeSelections(
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
      payCodeId: !detailsHaveDifferentPayCodeSelections
        ? undefined
        : v.payCodeId
        ? v.payCodeId
        : null,
      accountingCodeAllocations: !detailsHaveDifferentAccountingCodeSelections
        ? undefined
        : v.accountingCodeId
        ? [{ accountingCodeId: v.accountingCodeId, allocation: 1 }]
        : [],
    })) || undefined;

  // Populate the Vacancies on the Absence
  absence = {
    ...absence,
    /* TODO: When we support multi Position Employees we'll need to account for the following:
          When creating an Absence, there must be 1 Vacancy created here per Position Id.
      */
    vacancies: [
      {
        positionId: positionId,
        useSuppliedDetails: vDetails !== undefined,
        needsReplacement: needsReplacement,
        notesToReplacement: formValues.notesToReplacement,
        prearrangedReplacementEmployeeId: formValues.replacementEmployeeId,
        details: vDetails,
        accountingCodeAllocations:
          !detailsHaveDifferentAccountingCodeSelections &&
          formValues.accountingCode
            ? [
                {
                  accountingCodeId: formValues.accountingCode,
                  allocation: 1.0,
                },
              ]
            : undefined,
        payCodeId:
          !detailsHaveDifferentPayCodeSelections && formValues.payCode
            ? formValues.payCode
            : undefined,
      },
    ],
  };
  return absence;
};
