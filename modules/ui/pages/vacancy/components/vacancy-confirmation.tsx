import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { Section } from "ui/components/section";
import { VacancyCreateRoute, VacancyViewRoute } from "ui/routes/vacancy";
import { useRouteParams } from "ui/routes/definition";
import { VacancyStep } from "helpers/step-params";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import {
  VacancyScheduleDay,
  VacancySubstituteDetailsSection,
} from "./vacancy-substitute-details-section";

import { useMemo } from "react";
import { VacancyDetailSection } from "./vacancy-details-section";
import {
  Location as Loc,
  PositionType,
  Contract,
} from "graphql/server-types.gen";
import { AssignedSub } from "ui/components/absence/assigned-sub";
import { VacancyDetailsFormData } from "./vacancy";

type Props = {
  orgId: string;
  vacancyId: string;
  setStep?: (s: VacancyStep) => void;
  scheduleDays: VacancyScheduleDay[];
  notes: string;
  values: VacancyDetailsFormData;
  locations: Loc[];
  positionTypes: PositionType[];
  contracts: Contract[];
  setVacancyForCreate: React.Dispatch<
    React.SetStateAction<VacancyDetailsFormData>
  >;
  replacementEmployeeName?: string;
  unassignSub: (a: string | undefined) => Promise<void>;
};

export const VacancyConfirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(VacancyCreateRoute);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { orgId, setStep } = props;

  const editUrl = useMemo(() => {
    if (!props.vacancyId) {
      return "";
    }

    const url = VacancyViewRoute.generate({
      ...params,
      organizationId: orgId,
      vacancyId: props.vacancyId,
    });

    return url;
  }, [
    params,
    props.vacancyId,
  ]); /* eslint-disable-line react-hooks/exhaustive-deps */

  if (!props.vacancyId) {
    // Redirect the User back to the Absence Details step
    setStep && setStep("vacancy");

    return null;
  }

  return (
    <Section>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div className={classes.confirmationBanner}>
            <div>
              {t("Your vacancy has been saved. We'll take it from here.")}
            </div>
            <Typography variant="h1" className={classes.confirmationText}>
              {`${t("Confirmation #")} ${props.vacancyId}`}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} container>
          <Grid item xs={6}>
            <VacancyDetailSection
              orgId={params.organizationId}
              values={props.values}
              locations={props.locations}
              positionTypes={props.positionTypes}
              contracts={props.contracts}
              setFieldValue={(f, v) => {}}
              setVacancy={v => {}}
              readOnly={true}
              vacancyExists={true}
            />
          </Grid>
          <Grid item xs={6}>
            {props.values.details[0].prearrangedReplacementEmployeeId && (
              <Grid item xs={12}>
                <AssignedSub
                  employeeId={
                    props.values.details[0].prearrangedReplacementEmployeeId ??
                    ""
                  }
                  employeeName={props.replacementEmployeeName ?? ""}
                  subText={t("pre-arranged")}
                  vacancies={[]}
                  assignmentStartDate={props.values.details[0].date}
                  assignmentsByDate={props.values.details.map(d => {
                    return { date: d.date };
                  })}
                  onCancelAssignment={props.unassignSub}
                />
              </Grid>
            )}
            <VacancySubstituteDetailsSection
              scheduleDays={props.scheduleDays}
              showNotes={true}
              notes={props.notes}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => {
                props.setVacancyForCreate({
                  orgId: params.organizationId,
                  title: "",
                  positionTypeId: "",
                  contractId: "",
                  locationId: "",
                  workDayScheduleId: "",
                  details: [],
                  id: "",
                  rowVersion: "",
                });
                history.push(
                  VacancyCreateRoute.generate({
                    ...params,
                    organizationId: orgId,
                  })
                );
              }}
            >
              {t("Create New")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              component={Link}
              to={AdminChromeRoute.generate({
                ...params,
                organizationId: orgId,
              })}
            >
              {t("Back to List")}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to={editUrl}>
              {t("Edit")}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  confirmationBanner: {
    textAlign: "center",
    color: theme.customColors.white,
    backgroundColor: "#099E47",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  confirmationText: {
    marginTop: theme.spacing(2),
  },
}));
