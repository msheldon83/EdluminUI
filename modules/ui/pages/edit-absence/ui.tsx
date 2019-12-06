import { Typography } from "@material-ui/core";
import {
  NeedsReplacement,
  DayPart,
  AbsenceVacancyInput,
  Vacancy,
} from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { useQueryParamIso } from "hooks/query-params";
import { StepParams } from "./step-params";
import { EditAbsenceState, editAbsenceReducer } from "./state";
import { useReducer, useMemo, useState } from "react";
import { startOfMonth } from "date-fns/esm";
import { useQueryBundle } from "graphql/hooks";
import { format, endOfMonth, addMonths } from "date-fns";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { AbsenceDetails } from "ui/components/absence/absence-details";
import useForm from "react-hook-form";
import { VacancyDetail } from "../create-absence/types";
import { buildAbsenceCreateInput } from "../create-absence/ui";
import { GetProjectedVacancies } from "../create-absence/graphql/get-projected-vacancies.gen";
import { GetProjectedAbsenceUsage } from "../create-absence/graphql/get-projected-absence-usage.gen";

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
  absenceReasonId: number;
  absenceId: string;
  startDate: Date;
  endDate: Date;
  dayPart?: DayPart;
  initialVacancyDetails: VacancyDetail[];
  initialVacancies: Vacancy[];
};

type EditAbsenceFormData = {
  startDate: Date;
  endDate: Date;
  absenceReason: string;
  dayPart?: DayPart;
  hourlyStartTime?: Date;
  hourlyEndTime?: Date;
  notesToApprover?: string;
  notesToReplacement?: string;
  replacementEmployeeId?: number;
  replacementEmployeeName?: string;
  vacancies?: AbsenceVacancyInput[];
  accountingCode?: string;
  payCode?: string;
};

export const EditAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const [step, setStep] = useQueryParamIso(StepParams);
  const [state, dispatch] = useReducer(editAbsenceReducer, props, initialState);

  const [vacanciesInput, setVacanciesInput] = useState<VacancyDetail[]>();

  const name = `${props.firstName} ${props.lastName}`;

  const initialFormData: EditAbsenceFormData = {
    startDate: props.startDate,
    endDate: props.endDate,
    absenceReason: props.absenceReasonId.toString(),
    dayPart: props.dayPart,
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    triggerValidation,
  } = useForm<EditAbsenceFormData>({
    defaultValues: initialFormData,
  });

  const formValues = getValues();

  const disabledDates = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );

  const projectedVacanciesInput = useMemo(
    () =>
      buildAbsenceCreateInput(
        formValues,
        Number(props.organizationId),
        Number(state.employeeId),
        Number(props.positionId),
        disabledDates,
        vacanciesInput !== undefined,
        { ...state, organizationId: props.organizationId },
        vacanciesInput
      ),
    [
      formValues.startDate,
      formValues.endDate,
      formValues.absenceReason,
      formValues.dayPart,
      formValues.hourlyStartTime,
      formValues.hourlyEndTime,
      vacanciesInput,
      state,
      props.positionId,
      disabledDates,
    ]
  );

  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: projectedVacanciesInput!,
    },
    skip: !vacanciesInput || projectedVacanciesInput === null,
    onError: () => {},
  });

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: projectedVacanciesInput!,
    },
    skip: !vacanciesInput || projectedVacanciesInput === null,
    // fetchPolicy: "no-cache",
    onError: () => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const projectedVacancyDetails: VacancyDetail[] = useMemo(() => {
    /* cf 2019-11-25
       we don't currently support having multiple AbsenceVacancyInputs on this page.
       as such, this projection can't handle that case
     */
    if (
      !(
        getProjectedVacancies.state === "DONE" ||
        getProjectedVacancies.state === "UPDATING"
      )
    ) {
      return [];
    }
    const vacancies = getProjectedVacancies.data.absence?.projectedVacancies;
    if (!vacancies || vacancies.length < 1) {
      return [];
    }
    return (vacancies[0]?.details ?? [])
      .map(d => ({
        date: d?.startDate,
        locationId: d?.locationId,
        startTime: d?.startTimeLocal,
        endTime: d?.endTimeLocal,
      }))
      .filter(
        (detail): detail is VacancyDetail =>
          detail.locationId && detail.date && detail.startTime && detail.endTime
      );
  }, [getProjectedVacancies.state]);

  const theVacancyDetails: VacancyDetail[] =
    projectedVacancyDetails || props.initialVacancyDetails;

  return (
    <>
      <PageTitle title={t("Edit Absence")} withoutHeading />
      {props.actingAsEmployee ? (
        <Typography variant="h1">{t("Edit absence")}</Typography>
      ) : (
        <>
          <Typography variant="h5">{t("Edit absence")}</Typography>
          <Typography variant="h1">{name}</Typography>
        </>
      )}
      <form
        onSubmit={handleSubmit(async data => {
          console.log("submit edit data", data);
        })}
      >
        {step === "absence" && (
          <Section>
            <AbsenceDetails
              saveLabel={t("Save")}
              setStep={setStep}
              disabledDates={disabledDates}
              isAdmin={props.userIsAdmin}
              needsReplacement={props.needsReplacement}
              organizationId={props.organizationId}
              wantsReplacement={state.needsReplacement}
              onSwitchMonth={d => dispatch({ action: "switchMonth", month: d })}
              onSubstituteWantedChange={subWanted =>
                dispatch({ action: "setNeedsReplacement", to: subWanted })
              }
              values={formValues}
              setValue={setValue}
              errors={{}}
              triggerValidation={triggerValidation}
              vacancies={props.initialVacancies}
              balanceUsageText="TBD"
              setVacanciesInput={setVacanciesInput}
            />
          </Section>
        )}
      </form>
    </>
  );
};

const initialState = (props: Props): EditAbsenceState => ({
  employeeId: props.employeeId,
  absenceId: props.absenceId,
  viewingCalendarMonth: startOfMonth(new Date()),
  needsReplacement: props.needsReplacement !== NeedsReplacement.No,
});
