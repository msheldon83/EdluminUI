import {
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useForm } from "forms";
import { useQueryBundle } from "graphql/hooks";
import {
  DayPart,
  NeedsReplacement,
  VacancyDetail,
  Maybe,
} from "graphql/server-types.gen";
import * as React from "react";
import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { AbsenceDetails } from "./absence-details";
import { GetEmployee } from "./graphql/get-employee.gen";
import { createAbsenceReducer, CreateAbsenceState } from "./state";
import { useIsAdmin } from "reference-data/is-admin";
import { AssignSub } from "./assign-sub/index";

type Props = {
  firstName: string;
  lastName: string;
  employeeId: string;
  actingAsEmployee?: boolean;
  organizationId: string;
  needsReplacement: NeedsReplacement;
  userIsAdmin: boolean;
  positionId?: number | null | undefined;
  positionName?: string | null | undefined;
};

export const CreateAbsenceUI: React.FC<Props> = props => {
  const { t } = useTranslation();
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

  const name = `${props.firstName} ${props.lastName}`;

  return (
    <>
      <PageTitle title={t("Create absence")} withoutHeading />

      {/* {JSON.stringify(getValues())} */}

      <form onSubmit={handleSubmit((data, e) => console.log(data))}>
        {state.step === "absence" && (
          <>
            {props.actingAsEmployee ? (
              <Typography variant="h1">{t("Create absence")}</Typography>
            ) : (
              <>
                <Typography variant="h5">{t("Create absence")}</Typography>
                <Typography variant="h1">{name}</Typography>
              </>
            )}
            <Section className={classes.absenceDetails}>
              <AbsenceDetails
                state={state}
                setValue={setValue}
                values={getValues()}
                isAdmin={props.userIsAdmin}
                needsReplacement={props.needsReplacement}
                showAssignSub={() => {
                  dispatch({
                    action: "switchStep",
                    step: "assignSub",
                  });
                }}
              />
            </Section>
          </>
        )}
        {state.step === "assignSub" && (
          <AssignSub
            orgId={props.organizationId}
            userIsAdmin={props.userIsAdmin}
            employeeName={name}
            positionId={props.positionId}
            positionName={props.positionName}
            // TODO: This should be coming from the query to get Projected Vacancies
            // but hardcoding so we can see some data until that call is in place
            vacancies={[
              {
                startTimeLocal: new Date("11/1/2019 08:00 AM"),
                endTimeLocal: new Date("11/10/2019 05:00 PM"),
                numDays: 7,
                positionId: 1,
                details: [
                  {
                    startTimeLocal: new Date("11/1/2019 07:00 AM"),
                    endTimeLocal: new Date("11/1/2019 05:00 PM"),
                    locationId: 1,
                    location: {
                      name: "Evans Elementary School",
                    },
                  },
                ] as Maybe<VacancyDetail[]>,
              },
            ]}
          />
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
