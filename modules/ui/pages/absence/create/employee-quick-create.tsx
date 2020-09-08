import * as React from "react";
import { useTranslation } from "react-i18next";
import { NeedsReplacement, AbsenceCreateInput } from "graphql/server-types.gen";
import { makeStyles, Button } from "@material-ui/core";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "../components/absence-details";
import { absenceReducer } from "../state";
import { startOfMonth, min, isSameDay } from "date-fns";
import { Formik } from "formik";
import { AbsenceFormValidationSchema } from "../validation";
import { PermissionEnum } from "graphql/server-types.gen";
import { useMutationBundle } from "graphql/hooks";
import { useHistory } from "react-router-dom";
import { AbsenceFormData } from "../types";
import { CreateAbsence } from "../graphql/create.gen";
import { ApolloError } from "apollo-client";
import { ErrorDialog } from "ui/components/error-dialog";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { getCannotCreateAbsenceDates } from "ui/components/absence/helpers";
import { some } from "lodash-es";
import { NeedsReplacementCheckbox } from "../components/needs-replacement";
import { TextButton } from "ui/components/text-button";
import {
  EmployeeCreateAbsenceConfirmationRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/absence";
import { buildAbsenceInput } from "../helpers";

type Props = {
  employeeId: string;
  locationIds: string[];
  positionId?: string;
  positionTypeId?: string;
  organizationId: string;
  defaultReplacementNeeded?: NeedsReplacement | null;
};

export const EmployeeQuickAbsenceCreate: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const {
    employeeId,
    locationIds,
    positionId,
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
    positionId: positionId ?? "0",
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

  const quickCreateAbsence = React.useCallback(
    async (data: AbsenceFormData, ignoreWarnings?: boolean) => {
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
        history.push(
          EmployeeCreateAbsenceConfirmationRoute.generate({
            absenceId: result.data.absence.create.id,
          })
        );
      }
    },
    [createAbsenceMutation, disabledDates, history, state]
  );

  const initialFormData: AbsenceFormData = {
    details: [],
    needsReplacement: defaultReplacementNeeded !== NeedsReplacement.No,
    sameReasonForAllDetails: true,
    sameTimesForAllDetails: true,
    requireNotesToApprover: false,
  };

  return (
    <Section>
      <Formik
        initialValues={initialFormData}
        enableReinitialize={true}
        validationSchema={AbsenceFormValidationSchema(t)}
        onSubmit={async data => {
          await quickCreateAbsence(data);
        }}
      >
        {({ values, handleSubmit, setFieldValue, dirty, isSubmitting }) => {
          const projectionInput = buildAbsenceInput(
            values,
            state,
            [],
            disabledDates,
            true
          ) as AbsenceCreateInput;

          // There are some conditions that prohibit an Employee from using
          // the Quick Create option and instead they have to go to the full
          // Absence Create screen. Those should be accounted for here so we
          // can use additionalDetailsRequired to denote that scenario
          const additionalDetailsRequired = values.requireNotesToApprover;

          return (
            <form id="absence-form" onSubmit={handleSubmit}>
              <ErrorDialog
                open={!!(saveErrorsInfo?.error && !saveErrorsInfo?.confirmed)}
                title={t("There was an issue creating the absence")}
                warningsOnlyTitle={t(
                  "Hmm, we found a possible issue. Would you like to continue?"
                )}
                apolloErrors={saveErrorsInfo?.error ?? null}
                onClose={() =>
                  setSaveErrorsInfo({ error: null, confirmed: true })
                }
                continueAction={async () => {
                  await quickCreateAbsence(values, true);
                }}
              />
              <AbsenceDetails
                headerText={t("Create absence")}
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
                isQuickCreate={true}
              />
              <div className={classes.needsReplacement}>
                <NeedsReplacementCheckbox
                  permissions={[PermissionEnum.AbsVacManualFillMode]}
                  actingAsEmployee={true}
                  needsReplacement={
                    defaultReplacementNeeded ?? NeedsReplacement.No
                  }
                  value={values.needsReplacement}
                  onChangeRequiresSub={checked =>
                    setFieldValue("needsReplacement", checked)
                  }
                />
              </div>
              {additionalDetailsRequired && (
                <div className={classes.blockCreateMessage}>
                  {t(
                    "More details are required to create this absence.  Click Add additional details."
                  )}
                </div>
              )}
              <div className={classes.buttons}>
                <TextButton
                  disabled={isSubmitting}
                  className={classes.additionalButton}
                  onClick={() =>
                    history.push(EmployeeCreateAbsenceRoute.generate({}), {
                      initialFormData: values,
                    })
                  }
                >
                  {t("Add additional details")}
                </TextButton>
                <Button
                  disabled={
                    !dirty ||
                    isSubmitting ||
                    negativeBalanceWarning ||
                    values.requireNotesToApprover
                  }
                  variant="outlined"
                  type="submit"
                >
                  {t("Quick Create")}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  needsReplacement: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  additionalButton: {
    marginRight: theme.spacing(3),
  },
  blockCreateMessage: {
    borderRadius: theme.typography.pxToRem(4),
    backgroundColor: theme.palette.error.main,
    color: theme.customColors.white,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));
