import { makeStyles } from "@material-ui/core";
import { isBefore, isSameDay, startOfDay, startOfMonth } from "date-fns";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  AbsenceCreateInput,
  DayPart,
  NeedsReplacement,
} from "graphql/server-types.gen";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { useDialog } from "hooks/use-dialog";
import { useSnackbar } from "hooks/use-snackbar";
import { size, some, compact, flatMap } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import useForm from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import {
  useAbsenceReasons,
  useAbsenceReasonOptionsWithCategories,
} from "reference-data/absence-reasons";
import {
  createAbsenceDetailInput,
  getAbsenceDates,
  TranslateAbsenceErrorCodeToMessage,
  getCannotCreateAbsenceDates,
} from "ui/components/absence/helpers";
import { ShowIgnoreAndContinueOrError } from "ui/components/error-helpers";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { CreateAbsence } from "ui/pages/create-absence/graphql/create.gen";
import { CreateAbsenceConfirmationRoute } from "ui/routes/create-absence";
import { QuickAbsenceCreateUI } from "./quick-create-absence-ui";
import { quickCreateAbsenceReducer, QuickCreateAbsenceState } from "./state";
import { GetProjectedAbsenceUsage } from "ui/pages/create-absence/graphql/get-projected-absence-usage.gen";

type QuickCreateAbsenceFormData = {
  absenceReason: string;
  dayPart?: DayPart;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
};

type Props = {
  employeeId: string;
  positionTypeId?: string;
  organizationId: string;
  defaultReplacementNeeded?: NeedsReplacement | null;
};

export const QuickAbsenceCreate: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openDialog } = useDialog();
  const history = useHistory();

  const [requireAdminNotes, setRequireAdminNotes] = React.useState(false);

  const initialState = (props: Props): QuickCreateAbsenceState => ({
    employeeId: props.employeeId,
    organizationId: props.organizationId,
    viewingCalendarMonth: startOfMonth(new Date()),
    needsReplacement: props.defaultReplacementNeeded !== NeedsReplacement.No,
    selectedAbsenceDates: [],
  });

  const [state, dispatch] = React.useReducer(
    quickCreateAbsenceReducer,
    props,
    initialState
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    triggerValidation,
    formState,
  } = useForm<QuickCreateAbsenceFormData>({
    defaultValues: { absenceReason: "" },
  });

  const formValues = getValues();

  const required = t("Required");
  register({ name: "absenceReason", type: "custom" }, { required });
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "needsReplacement", type: "custom" });
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

  const [createAbsenceMutation] = useMutationBundle(CreateAbsence, {
    onError: error => {
      ShowIgnoreAndContinueOrError(
        error,
        openDialog,
        t("There was an issue creating the absence"),
        t("Hmm, we found a possible issue. Would you like to continue?"),
        async () => await quickCreateAbsence(),
        t,
        TranslateAbsenceErrorCodeToMessage
      );
    },
    refetchQueries: [
      "GetEmployeeContractSchedule",
      "GetEmployeeContractScheduleDates",
      "GetEmployeeAbsenceSchedule",
    ],
  });

  const absenceReasons = useAbsenceReasons(props.organizationId);
  const filteredAbsenceReasons = props.positionTypeId
    ? absenceReasons.filter(
        ar =>
          ar.positionTypeIds.includes(props.positionTypeId!) ||
          ar.allPositionTypes
      )
    : absenceReasons;

  const absenceReasonOptions = useAbsenceReasonOptionsWithCategories(
    props.organizationId,
    undefined,
    props.positionTypeId
  );

  const onReasonChange = React.useCallback(
    async event => {
      await setValue("absenceReason", event.value);
      await triggerValidation({ name: "absenceReason" });
      setRequireAdminNotes(
        filteredAbsenceReasons.find(ar => ar.id === event.value)
          ?.requireNotesToAdmin || false
      );
    },
    [setValue, triggerValidation, filteredAbsenceReasons]
  );

  const onMonthChange = (month: Date) =>
    dispatch({ action: "switchMonth", month });

  const disabledDateObjs = useEmployeeDisabledDates(
    props.employeeId,
    state.viewingCalendarMonth
  );

  const disabledDates = useMemo(
    () => getCannotCreateAbsenceDates(disabledDateObjs),
    [disabledDateObjs]
  );

  React.useEffect(() => {
    const conflictingDates = disabledDates.filter(dis =>
      some(state.selectedAbsenceDates, ad => isSameDay(ad, dis))
    );
    if (conflictingDates.length > 0) {
      dispatch({ action: "removeAbsenceDates", dates: conflictingDates });
    }
  }, [disabledDateObjs, disabledDates, state.selectedAbsenceDates]);

  const onDayPartChange = React.useCallback(
    async (value: DayPart | undefined) => await setValue("dayPart", value),
    [setValue]
  );
  const onHourlyStartTimeChange = React.useCallback(
    async (start: Date | undefined) => await setValue("hourlyStartTime", start),
    [setValue]
  );
  const onHourlyEndTimeChange = React.useCallback(
    async (end: Date | undefined) => await setValue("hourlyEndTime", end),
    [setValue]
  );

  const absenceCreateInput = createQuickAbsenceInputs(
    props.organizationId,
    props.employeeId,
    formValues,
    state.selectedAbsenceDates,
    disabledDates
  );

  const quickCreateAbsence = async () => {
    // if (ignoreWarnings) {
    //   absenceCreateInput = {
    //     ...absenceCreateInput,
    //     ignoreWarnings: true,
    //   };
    // }
    if (!absenceCreateInput) return;
    const result = await createAbsenceMutation({
      variables: {
        absence: absenceCreateInput,
      },
    });

    if (result?.data?.absence?.create) {
      history.push(
        CreateAbsenceConfirmationRoute.generate({
          absenceId: result.data.absence.create.id,
        })
      );
    }
  };

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: {
        ...absenceCreateInput!,
        ignoreWarnings: true,
      },
    },
    skip: absenceCreateInput === null,
    // fetchPolicy: "no-cache",
    onError: () => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const absenceBalanceUsages = useMemo(() => {
    if (
      !(
        getProjectedAbsenceUsage.state === "DONE" ||
        getProjectedAbsenceUsage.state === "UPDATING"
      )
    )
      return null;

    return compact(
      flatMap(
        getProjectedAbsenceUsage.data.absence?.projectedAbsence?.details,
        d => d?.reasonUsages?.map(ru => ru)
      )
    );
  }, [getProjectedAbsenceUsage]);

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

  return (
    <form
      onSubmit={handleSubmit(async data => {
        await quickCreateAbsence();
      })}
    >
      <Section>
        <SectionHeader title={t("Create absence")} />
        <QuickAbsenceCreateUI
          isSubmitting={formState.isSubmitting}
          organizationId={props.organizationId}
          employeeId={props.employeeId}
          selectedAbsenceReason={formValues.absenceReason}
          absenceReasonOptions={absenceReasonOptions}
          onAbsenceReasonChange={onReasonChange}
          absenceReasonError={errors.absenceReason}
          onMonthChange={onMonthChange}
          selectedAbsenceDates={state.selectedAbsenceDates}
          currentMonth={state.viewingCalendarMonth}
          onToggleAbsenceDate={(d: Date) =>
            dispatch({ action: "toggleDate", date: d })
          }
          selectedDayPart={formValues.dayPart}
          onDayPartChange={onDayPartChange}
          startTimeError={errors.startTimeError}
          endTimeError={errors.endTimeError}
          hourlyStartTime={formValues.hourlyStartTime}
          hourlyEndTime={formValues.hourlyEndTime}
          onHourlyStartTimeChange={onHourlyStartTimeChange}
          onHourlyEndTimeChange={onHourlyEndTimeChange}
          onNeedsReplacementChange={needsReplacement =>
            dispatch({ action: "setNeedsReplacement", to: needsReplacement })
          }
          wantsReplacement={state.needsReplacement}
          needsReplacement={props.defaultReplacementNeeded}
          usages={absenceBalanceUsages}
          requireAdminNotes={requireAdminNotes}
        />
      </Section>
    </form>
  );
};

const useStyles = makeStyles(theme => ({}));

const createQuickAbsenceInputs = (
  organizationId: string,
  employeeId: string,
  formData: QuickCreateAbsenceFormData,
  absenceDates: Date[],
  disabledDates: Date[]
): AbsenceCreateInput | null => {
  if (!formData.absenceReason || !formData.dayPart) {
    return null;
  }
  const dates = getAbsenceDates(absenceDates, disabledDates);
  if (!dates) return null;

  // Must have a start and end time if Hourly
  if (
    formData.dayPart === DayPart.Hourly &&
    (!formData.hourlyStartTime ||
      !formData.hourlyEndTime ||
      isBefore(formData.hourlyEndTime, formData.hourlyStartTime))
  ) {
    return null;
  }
  const details = createAbsenceDetailInput(
    dates,
    formData.absenceReason,
    formData.dayPart,
    formData.hourlyStartTime,
    formData.hourlyEndTime
  );

  return {
    orgId: organizationId,
    employeeId: employeeId,
    details,
  };
};
