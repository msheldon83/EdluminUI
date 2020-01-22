import { makeStyles } from "@material-ui/core";
import {
  addMonths,
  isBefore,
  startOfDay,
  startOfMonth,
  isSameDay,
} from "date-fns";
import { useMutationBundle } from "graphql/hooks";
import {
  AbsenceCreateInput,
  DayPart,
  NeedsReplacement,
} from "graphql/server-types.gen";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { useDialog } from "hooks/use-dialog";
import * as React from "react";
import { useMemo } from "react";
import useForm from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useIsAdmin } from "reference-data/is-admin";
import {
  createAbsenceDetailInput,
  getAbsenceDates,
  TranslateAbsenceErrorCodeToMessage,
} from "ui/components/absence/helpers";
import { ShowIgnoreAndContinueOrError } from "ui/components/error-helpers";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { CreateAbsence } from "ui/pages/create-absence/graphql/create.gen";
import { CreateAbsenceConfirmationRoute } from "ui/routes/create-absence";
import { QuickAbsenceCreateUI } from "./quick-create-absence-ui";
import { quickCreateAbsenceReducer, QuickCreateAbsenceState } from "./state";
import { useSnackbar } from "hooks/use-snackbar";
import { size, some } from "lodash-es";

type QuickCreateAbsenceFormData = {
  absenceReason: string;
  dayPart?: DayPart;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
};

type Props = {
  employeeId: string;
  organizationId: string;
  defaultReplacementNeeded?: NeedsReplacement | null;
};

export const QuickAbsenceCreate: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openDialog } = useDialog();
  const history = useHistory();

  const initialState = (props: Props): QuickCreateAbsenceState => ({
    employeeId: props.employeeId,
    organizationId: props.organizationId,
    viewingCalendarMonth: startOfMonth(new Date()),
    needsReplacement: props.defaultReplacementNeeded !== NeedsReplacement.No,
    selectedAbsenceDates: [startOfDay(new Date())],
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
        async () =>
          await quickCreateAbsence(formValues, state.selectedAbsenceDates),
        t,
        TranslateAbsenceErrorCodeToMessage
      );
    },
  });

  const quickCreateAbsence = async (
    formData: QuickCreateAbsenceFormData,
    absenceDates: Date[]
  ) => {
    const absenceCreateInput = createQuickAbsenceInputs(
      props.organizationId,
      props.employeeId,
      formData,
      absenceDates,
      disabledDates
    );
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

  const absenceReasons = useAbsenceReasons(props.organizationId);
  const absenceReasonOptions = useMemo(
    () => absenceReasons.map(r => ({ label: r.name, value: r.id })),
    [absenceReasons]
  );

  const onReasonChange = React.useCallback(
    async event => {
      await setValue("absenceReason", event.value);
      await triggerValidation({ name: "absenceReason" });
    },
    [setValue, triggerValidation]
  );

  const onMonthChange = (month: Date) =>
    dispatch({ action: "switchMonth", month });

  const disabledDateObjs = useEmployeeDisabledDates(
    props.employeeId,
    state.viewingCalendarMonth
  );

  const existingAbsenceDates = useMemo(
    () => disabledDateObjs.filter(d => d.type === "absence").map(d => d.date),
    [disabledDateObjs]
  );

  React.useEffect(() => {
    const conflictingDates = disabledDateObjs
      .map(dis => dis.date)
      .filter(dis =>
        some(state.selectedAbsenceDates, ad => isSameDay(ad, dis))
      );
    if (conflictingDates.length > 0) {
      dispatch({ action: "removeAbsenceDates", dates: conflictingDates });
    }
  }, [disabledDateObjs]);

  const disabledDates = useMemo(
    () =>
      disabledDateObjs
        .filter(dis => dis.type === "nonWorkDay")
        .map(d => d.date),
    [disabledDateObjs]
  );

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

  const userIsAdmin = useIsAdmin();

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
        await quickCreateAbsence(data, state.selectedAbsenceDates);
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
          disabledDates={disabledDates}
          existingAbsenceDates={existingAbsenceDates}
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
          isAdmin={!!userIsAdmin}
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
    orgId: Number(organizationId),
    employeeId: Number(employeeId),
    details,
  };
};
