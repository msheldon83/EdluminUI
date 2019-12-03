import { Typography } from "@material-ui/core";
import { NeedsReplacement } from "graphql/server-types.gen";
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
      {step === "absence" && (
        <Section>
          <>absence details</>
        </Section>
      )}
    </>
  );
};

const initialState = (props: Props): EditAbsenceState => ({
  employeeId: props.employeeId,
  absenceId: props.absenceId,
  viewingCalendarMonth: startOfMonth(new Date()),
  needsReplacement: props.needsReplacement !== NeedsReplacement.No,
});
