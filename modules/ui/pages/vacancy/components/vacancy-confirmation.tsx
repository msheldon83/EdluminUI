import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { Section } from "ui/components/section";
import { VacancyCreateRoute, VacancyViewRoute } from "ui/routes/vacancy";
import { useRouteParams } from "ui/routes/definition";
import { VacancyStep } from "helpers/step-params";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useMemo, useState } from "react";
import { VacancyDetailSection } from "./vacancy-details-section";
import {
  Location as Loc,
  PositionType,
  Contract,
  VacancyReason,
} from "graphql/server-types.gen";
import { VacancyDetailsFormData } from "../helpers/types";
import { VacancySummaryDetail } from "ui/components/absence-vacancy/vacancy-summary/types";
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary";

type Props = {
  orgId: string;
  vacancyId: string;
  setStep?: (s: VacancyStep) => void;
  notes: string;
  values: VacancyDetailsFormData;
  locations: Loc[];
  positionTypes: PositionType[];
  contracts: Contract[];
  setVacancyForCreate: React.Dispatch<
    React.SetStateAction<VacancyDetailsFormData>
  >;
  vacancySummaryDetails: VacancySummaryDetail[];
  onCancelAssignment: (vacancyDetailIds?: string[]) => Promise<void>;
  vacancyReasons: VacancyReason[];
  orgHasPayCodesDefined: boolean;
  orgHasAccountingCodesDefined: boolean;
};

export const VacancyConfirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(VacancyCreateRoute);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    orgId,
    setStep,
    vacancyId,
    vacancySummaryDetails,
    onCancelAssignment,
    notes,
    vacancyReasons,
    orgHasPayCodesDefined,
    orgHasAccountingCodesDefined,
  } = props;

  const editUrl = useMemo(() => {
    if (!vacancyId) {
      return "";
    }

    const url = VacancyViewRoute.generate({
      ...params,
      organizationId: orgId,
      vacancyId: vacancyId,
    });

    return url;
  }, [params, orgId, vacancyId]);

  if (!vacancyId) {
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
              {`${t("Confirmation #")} ${vacancyId}`}
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
              vacancyReasons={vacancyReasons}
            />
          </Grid>
          <Grid item xs={6}>
            <VacancySummary
              vacancySummaryDetails={vacancySummaryDetails}
              onCancelAssignment={onCancelAssignment}
              notesForSubstitute={notes}
              showPayCodes={orgHasPayCodesDefined}
              showAccountingCodes={orgHasAccountingCodesDefined}
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
                  locationName: "",
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
