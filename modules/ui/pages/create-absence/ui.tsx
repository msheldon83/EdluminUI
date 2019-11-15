import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useForm } from "forms";
import { useQueryBundle } from "graphql/hooks";
import { DayPart, NeedsReplacement } from "graphql/server-types.gen";
import * as React from "react";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "./absence-details";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { GetEmployeeContractSchedule } from "./graphql/get-contract-schedule.gen";
import { format, startOfMonth, endOfMonth } from "date-fns";

type Props = {
  firstName: string;
  lastName: string;
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
  needsReplacement: NeedsReplacement;
  userIsAdmin: boolean;
  positionId?: string;
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );
  const today = new Date();
  const initialFormData: FormData = {
    startDate: today,
    endDate: today,
    absenceReason: "",
    needsReplacement: props.needsReplacement !== NeedsReplacement.No,
  };

  const contractSchedule = useQueryBundle(GetEmployeeContractSchedule, {
    variables: {
      id: props.employeeId,
      fromDate: format(state.viewingCalendarMonth, "yyyy-M-d"),
      toDate: format(endOfMonth(state.viewingCalendarMonth), "yyyy-M-d"),
    },
  });

  contractSchedule.state === "DONE" &&
    console.log(contractSchedule.data.employee?.employeeContractSchedule);

  const {
    register,
    handleSubmit,
    setValue,
    formState,
    getValues,
    errors,
  } = useForm<FormData>({
    defaultValues: initialFormData,
  });

  const required = t("Required");
  register({ name: "dayPart", type: "custom" }, { required });
  register({ name: "absenceReason", type: "custom" }, { required });
  register({ name: "startDate", type: "custom" }, { required });
  register({ name: "endDate", type: "custom" }, { required });
  register({ name: "needsReplacement", type: "custom" });
  register({ name: "notesToApprover", type: "custom" });
  register({ name: "notesToReplacement", type: "custom" });

  const name = `${props.firstName} ${props.lastName}`;

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />
      {props.actingAsEmployee ? (
        <Typography variant="h1">{t("Create absence")}</Typography>
      ) : (
        <>
          <Typography variant="h5">{t("Create absence")}</Typography>
          <Typography variant="h1">{name}</Typography>
        </>
      )}

      {/* {JSON.stringify(getValues())} */}

      <form onSubmit={handleSubmit((data, e) => console.log(data))}>
        {state.step === "absence" && (
          <Section className={classes.absenceDetails}>
            <AbsenceDetails
              state={state}
              dispatch={dispatch}
              setValue={setValue}
              values={getValues()}
              isAdmin={props.userIsAdmin}
              needsReplacement={props.needsReplacement}
            />
          </Section>
        )}
      </form>
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

const initialState = (props: Props): CreateAbsenceState => ({
  employeeId: props.employeeId,
  organizationId: props.organizationId,
  step: "absence",
  viewingCalendarMonth: startOfMonth(new Date()),
});

export type FormData = {
  startDate: Date;
  endDate: Date;
  absenceReason: string;
  dayPart?: DayPart;
  notesToApprover?: string;
  notesToReplacement?: string;
  needsReplacement: boolean;
};
