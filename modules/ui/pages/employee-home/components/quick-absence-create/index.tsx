import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Grid,
  Checkbox,
  Link,
  Typography,
} from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useIsAdmin } from "reference-data/is-admin";
import { useGetEmployee } from "reference-data/employee";
import { useQueryBundle } from "graphql/hooks";
import { FindEmployeeForCurrentUser } from "ui/pages/create-absence/graphql/find-employee-for-current-user.gen";
import { findEmployee } from "ui/components/absence/helpers";
import { NeedsReplacement, DayPart } from "graphql/server-types.gen";
import useForm from "react-hook-form";
import { useCallback, useMemo } from "react";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { Select } from "ui/components/form/select";
import { DayPartField } from "ui/components/absence/day-part-field";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { QuickAbsenceCreateUI } from "./quick-create-absence-ui";
import { QuickCreateAbsenceState, quickCreateAbsenceReducer } from "./state";
import { startOfMonth, startOfDay, addMonths } from "date-fns";

type Props = {
  employeeId: string;
  organizationId: string;
  defaultReplacementNeeded?: NeedsReplacement | null;
};

export const QuickAbsenceCreate: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const initialState = (props: Props): QuickCreateAbsenceState => ({
    employeeId: props.employeeId,
    organizationId: props.organizationId,
    viewingCalendarMonth: startOfMonth(new Date()),
    needsReplacement: props.defaultReplacementNeeded !== NeedsReplacement.No,
    absenceDates: [startOfDay(new Date())],
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
  } = useForm({
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

  const viewPreviousMonth = React.useCallback(() => {
    const previousMonth = addMonths(state.viewingCalendarMonth, -1);
    dispatch({ action: "switchMonth", month: previousMonth });
  }, [state.viewingCalendarMonth]);

  const viewNextMonth = React.useCallback(() => {
    const nextMonth = addMonths(state.viewingCalendarMonth, 1);
    dispatch({ action: "switchMonth", month: nextMonth });
  }, [state.viewingCalendarMonth]);

  const disabledDateObjs = useEmployeeDisabledDates(
    props.employeeId,
    state.viewingCalendarMonth
  );

  const disabledDates = useMemo(() => disabledDateObjs.map(d => d.date), [
    disabledDateObjs,
  ]);

  // const userIsAdmin = useIsAdmin();
  // const potentialEmployees = useQueryBundle(FindEmployeeForCurrentUser, {
  //   fetchPolicy: "cache-first",
  // });
  // if (
  //   (potentialEmployees.state !== "DONE" &&
  //     potentialEmployees.state !== "UPDATING") ||
  //   userIsAdmin === null
  // ) {
  //   return <></>;
  // }

  // const employee = findEmployee(potentialEmployees.data);
  // if (!employee) {
  //   throw new Error("The user is not an employee");
  // }
  // const needsReplacement =
  //   employee.primaryPosition?.needsReplacement ?? NeedsReplacement.No;

  return (
    <Section>
      <SectionHeader title={t("Create absence")} />
      <QuickAbsenceCreateUI
        organizationId={props.organizationId}
        absenceReason={formValues.absenceReason}
        absenceReasonOptions={absenceReasonOptions}
        onAbsenceReasonChange={onReasonChange}
        absenceReasonError={errors.absenceReason}
        viewPreviousMonth={viewPreviousMonth}
        viewNextMonth={viewNextMonth}
        absenceDates={state.absenceDates}
        currentMonth={state.viewingCalendarMonth}
        onToggleAbsenceDate={(d: Date) =>
          dispatch({ action: "toggleDate", date: d })
        }
        disabledDates={disabledDates}
      />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({}));
