import { Button, Grid, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { PageTitle } from "ui/components/page-title";
import { OrgUser, Vacancy } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { useRouteParams } from "ui/routes/definition";
import { SubHomeRoute } from "ui/routes/sub-home";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { AvailableJob } from "ui/pages/sub-home/components/available-job";
import { SubSpecificOpportunityRoute } from "ui/routes/sub-specific-opportunity";
import { RequestAbsenceDialog } from "ui/pages/sub-home/components/request-dialog";
import { DismissVacancy } from "ui/pages/sub-home/graphql/dismiss-vacancy.gen";
import { GetVacancyById } from "./graphql/get-opportunity-by-id.gen";
import { RequestVacancy } from "ui/pages/sub-home/graphql/request-vacancy.gen";
import { QueryOrgUsers } from "ui/pages/sub-home/graphql/get-orgusers.gen";

type Props = {};

export const SubSpecificOpportunity: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const params = useRouteParams(SubSpecificOpportunityRoute);
  const vacancyId = params.vacancyId;

  const isMobile = useIsMobile();
  const [requestAbsenceIsOpen, setRequestAbsenceIsOpen] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);

  const [dismissVacancyMutation] = useMutationBundle(DismissVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [requestVacancyMutation] = useMutationBundle(RequestVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getOrgUsers = useQueryBundle(QueryOrgUsers, {
    fetchPolicy: "cache-first",
  });

  const orgUsers = (getOrgUsers.state === "LOADING" ||
  getOrgUsers.state === "UPDATING"
    ? []
    : getOrgUsers.data?.userAccess?.me?.user?.orgUsers ?? []) as Pick<
    OrgUser,
    "id" | "orgId"
  >[];

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: {
      id: vacancyId,
    },
  });

  const vacancy = useMemo(
    () =>
      (getVacancy.state === "DONE" || getVacancy.state === "UPDATING"
        ? getVacancy.data.vacancy?.byId ?? null
        : null) as Pick<
        Vacancy,
        | "id"
        | "organization"
        | "position"
        | "absence"
        | "startTimeLocal"
        | "endTimeLocal"
        | "startDate"
        | "endDate"
        | "notesToReplacement"
        | "totalDayPortion"
        | "details"
      >,
    [getVacancy]
  );

  const onDismissVacancy = async (orgId: string, vacancyId: string) => {
    const employeeId = determineEmployeeId(orgId);
    if (employeeId != 0) {
      await Promise.resolve(
        dismissVacancyMutation({
          variables: {
            vacancyRejection: {
              vacancyId: vacancyId,
              employeeId: Number(employeeId),
            },
          },
        })
      );
    }
    history.push(SubHomeRoute.generate(params));
  };

  const determineEmployeeId = (orgId: string) => {
    const employeeId = orgUsers.find(o => o.orgId === Number(orgId))?.id ?? 0;
    return employeeId;
  };

  const onCloseRequestAbsenceDialog = async () => {
    setRequestAbsenceIsOpen(false);
    // TODO: send to specific assignment if accepted, or home page if not accepted
  };

  const onAcceptVacancy = async (orgId: string, vacancyId: string) => {
    const employeeId = determineEmployeeId(orgId);
    if (employeeId != 0) {
      await requestVacancyMutation({
        variables: {
          vacancyRequest: {
            vacancyId: vacancyId,
            employeeId: Number(employeeId),
          },
        },
      });
    }
    setEmployeeId(employeeId.toString());
    setRequestAbsenceIsOpen(true);
  };

  return (
    <>
      <PageTitle title={t("Available assignment")} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Section>
            <Grid
              container
              className={classes.header}
              justify="space-between"
              alignItems="center"
              spacing={2}
            >
              {getVacancy.state === "LOADING" ? (
                <Grid item>
                  <Typography variant="h5">
                    {t("Loading opportunity")}
                  </Typography>
                </Grid>
              ) : vacancy === null ? (
                <Grid item>
                  <Typography variant="h5">
                    {t("Job is no longer available")}
                  </Typography>
                  <Link
                    onClick={() => history.push(SubHomeRoute.generate(params))}
                  >
                    {t("Search for jobs")}
                  </Link>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <AvailableJob
                      vacancy={vacancy}
                      shadeRow={false}
                      onDismiss={onDismissVacancy}
                      onAccept={onAcceptVacancy}
                      forSingleJob={true}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">{t("Notes")}</Typography>
                    <div>{vacancy.notesToReplacement}</div>
                  </Grid>
                  <Grid
                    item
                    container
                    justify="flex-end"
                    alignItems="flex-end"
                    spacing={2}
                    xs={6}
                  >
                    <Grid item>
                      <Button
                        variant={isMobile ? "text" : "outlined"}
                        onClick={() =>
                          onDismissVacancy(vacancy.organization.id, vacancy.id)
                        }
                      >
                        {t("Dismiss")}
                      </Button>
                    </Grid>
                    {!isMobile && (
                      <Grid item>
                        <Button
                          variant="contained"
                          onClick={() =>
                            onAcceptVacancy(vacancy.organization.id, vacancy.id)
                          }
                        >
                          {t("Accept")}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </Grid>
          </Section>
        </Grid>
      </Grid>
      {isMobile && (
        <Section>
          <Grid container justify="flex-end" alignItems="flex-end">
            <Grid item>
              <Button
                variant="contained"
                onClick={() =>
                  onAcceptVacancy(vacancy.organization.id, vacancy.id)
                }
              >
                {t("Accept")}
              </Button>
            </Grid>
          </Grid>
        </Section>
      )}

      <RequestAbsenceDialog
        open={requestAbsenceIsOpen}
        onClose={onCloseRequestAbsenceDialog}
        employeeId={employeeId}
        vacancyId={vacancyId}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
}));
