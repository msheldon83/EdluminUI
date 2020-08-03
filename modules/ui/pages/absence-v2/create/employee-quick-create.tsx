import * as React from "react";
import { useTranslation } from "react-i18next";
import { NeedsReplacement, AbsenceCreateInput } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { AbsenceDetails } from "../components/absence-details";
import { absenceReducer } from "../state";
import { startOfMonth, min, isSameDay } from "date-fns";
import { Formik } from "formik";
import { AbsenceFormValidationSchema } from "../validation";
import { useMutationBundle } from "graphql/hooks";
import { useHistory } from "react-router-dom";
import { AbsenceFormData } from "../types";
import { buildAbsenceInput } from "../components/ui";
import { CreateAbsence } from "../graphql/create.gen";
import { ApolloError } from "apollo-client";
import { ErrorDialog } from "ui/components/error-dialog";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { getCannotCreateAbsenceDates } from "ui/components/absence/helpers";
import { some } from "lodash-es";

type Props = {
  employeeId: string;
  locationIds: string[];
  positionTypeId?: string;
  organizationId: string;
  defaultReplacementNeeded?: NeedsReplacement | null;
};

export const EmployeeQuickAbsenceCreateV2: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const {
    employeeId,
    locationIds,
    positionTypeId,
    organizationId,
    defaultReplacementNeeded,
  } = props;

  const [saveErrorsInfo, setSaveErrorsInfo] = React.useState<
    { error: ApolloError | null; confirmed: boolean } | undefined
  >();
  const [negativeBalanceWarning, setNegativeBalanceWarning] = React.useState(
    false
  );

  const [state, dispatch] = React.useReducer(absenceReducer, {
    employeeId: employeeId,
    organizationId: organizationId,
    positionId: employee.primaryPosition?.id ?? "0",
    viewingCalendarMonth: startOfMonth(new Date()),
    absenceDates: [],
    isClosed: false,
    closedDates: [],
    assignmentsByDate: [],
  });

  const [createAbsenceMutation] = useMutationBundle(CreateAbsence, {
    onError: error => {
      setSaveErrorsInfo({
        error,
        confirmed: false,
      });
    },
    refetchQueries: [
      "GetEmployeeContractSchedule",
      "GetEmployeeContractScheduleDates",
      "GetEmployeeAbsenceSchedule",
    ],
  });

  // Ensure the User is not able to select dates that are invalid
  const disabledDateObjs = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth,
    state.absenceDates && state.absenceDates.length > 0
      ? min(state.absenceDates)
      : undefined
  );
  const disabledDates = React.useMemo(
    () => getCannotCreateAbsenceDates(disabledDateObjs),
    [disabledDateObjs]
  );
  React.useEffect(() => {
    const conflictingDates = disabledDates.filter(dis =>
      some(state.absenceDates, ad => isSameDay(ad, dis))
    );
    if (conflictingDates.length > 0) {
      dispatch({ action: "removeAbsenceDates", dates: conflictingDates });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledDates]);

  const quickCreateAbsence = React.useCallback(async (
    data: AbsenceFormData,
    ignoreWarnings?: boolean
  ) => {
    // Build the create input
    const absenceCreateInput = buildAbsenceInput(
      data,
      state,
      [],
      disabledDates,
      true
    ) as AbsenceCreateInput;

    const result = await createAbsenceMutation({
      variables: {
        absence: { ...absenceCreateInput, ignoreWarnings },
      },
    });

    if (result?.data?.absence?.create) {
      // Need a new confirmation route???
      // history.push(        
      //   CreateAbsenceConfirmationRoute.generate({
      //     absenceId: result.data.absence.create.id,
      //   })
      // );
    }
  }, [createAbsenceMutation, disabledDates, state]);

  return (
    <Section>
      <SectionHeader title={t("Create absence")} />
      <Formik
        initialValues={{
          details: [],
          needsReplacement: defaultReplacementNeeded !== NeedsReplacement.No,
          sameReasonForAllDetails: true,
          sameTimesForAllDetails: true,
        }}
        enableReinitialize={true}
        validationSchema={AbsenceFormValidationSchema(t)}
        onSubmit={async data => {
          await quickCreateAbsence(data);
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
          initialValues,
          errors,
        }) => {
          const projectionInput = buildAbsenceInput(
            values,
            state,
            [],
            disabledDates,
            true
          ) as AbsenceCreateInput;

          return (
            <form id="absence-form" onSubmit={handleSubmit}>
              <ErrorDialog
                open={
                  !!(saveErrorsInfo?.error && !saveErrorsInfo?.confirmed)
                }
                title={
                  t("There was an issue creating the absence")
                }
                warningsOnlyTitle={t(
                  "Hmm, we found a possible issue. Would you like to continue?"
                )}
                apolloErrors={saveErrorsInfo?.error ?? null}
                onClose={() => setSaveErrorsInfo({ error: null, confirmed: true })}
                continueAction={async () => {
                  await quickCreateAbsence(values, true);
                }}
              />
              <AbsenceDetails
                organizationId={organizationId}
                employeeId={employeeId}
                actingAsEmployee={true}
                absenceDates={state.absenceDates}
                onToggleAbsenceDate={d =>
                  dispatch({ action: "toggleDate", date: d })
                }
                currentMonth={state.viewingCalendarMonth}
                onSwitchMonth={(d: Date) =>
                  dispatch({ action: "switchMonth", month: d })
                }
                projectionInput={projectionInput}
                positionTypeId={positionTypeId}
                onTimeChange={() => {
                  dispatch({
                    action: "setVacanciesInput",
                    input: undefined,
                  });
                }}
                setNegativeBalanceWarning={setNegativeBalanceWarning}
                canEditReason={true}
                canEditDatesAndTimes={true}
                travellingEmployee={locationIds.length > 1}
              />
            </form>
          );
        }}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({}));
