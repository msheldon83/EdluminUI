import {
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useForm } from "forms";
import { useQueryBundle } from "graphql/hooks";
import { DayPart, NeedsReplacement } from "graphql/server-types.gen";
import * as React from "react";
import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "./absence-details";
import { GetEmployee } from "./graphql/get-employee.gen";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { useIsAdmin } from "reference-data/is-admin";

type Props = {
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
  needsReplacement: NeedsReplacement;
  userIsAdmin: boolean;
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();

  let name = "";

  const classes = useStyles();

  const today = new Date();
  const initialFormData: FormData = {
    startDate: today,
    endDate: today,
    absenceReason: "",
    needsReplacement: props.needsReplacement !== NeedsReplacement.No,
  };

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

  const [state, dispatch] = useReducer(
    createAbsenceReducer,
    props,
    initialState
  );

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

const initialState = (props: Props): CreateAbsenceState => {
  const today = new Date();
  return {
    employeeId: props.employeeId,
    organizationId: props.organizationId,
    step: "absence",
  };
};

export type FormData = {
  startDate: Date;
  endDate: Date;
  absenceReason: string;
  dayPart?: DayPart;
  notesToApprover?: string;
  notesToReplacement?: string;
  needsReplacement: boolean;
};