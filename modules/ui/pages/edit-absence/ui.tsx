import { Typography } from "@material-ui/core";
import {
  NeedsReplacement,
  DayPart,
  AbsenceVacancyInput,
} from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { useQueryParamIso } from "hooks/query-params";
import { StepParams } from "./step-params";
import { EditAbsenceState, editAbsenceReducer } from "./state";
import { useReducer, useMemo } from "react";
import { startOfMonth } from "date-fns/esm";
import { useQueryBundle } from "graphql/hooks";
import { format, endOfMonth, addMonths } from "date-fns";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import { AbsenceDetails } from "ui/components/absence/absence-details";
import useForm from "react-hook-form";

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

  const disabledDates = useEmployeeDisabledDates(
    state.employeeId,
    state.viewingCalendarMonth
  );

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
              vacancies={[]}
              balanceUsageText="TBD"
              setVacanciesInput={details =>
                console.log("setVacanciesInput()", details)
              }
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
