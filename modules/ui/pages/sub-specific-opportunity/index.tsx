import { Button, Grid, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { PageTitle } from "ui/components/page-title";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { useRouteParams } from "ui/routes/definition";
import { SubHomeRoute } from "ui/routes/sub-home";
import { SubSpecificAssignmentRoute } from "ui/routes/sub-specific-assignment";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { AvailableJob } from "ui/pages/sub-home/components/available-job";
import { SubSpecificOpportunityRoute } from "ui/routes/sub-specific-opportunity";
import { DismissVacancy } from "ui/pages/sub-home/graphql/dismiss-vacancy.gen";
import { GetVacancyById } from "./graphql/get-opportunity-by-id.gen";
import { AcceptVacancy } from "ui/pages/sub-home/graphql/accept-vacancy.gen";
import { SaveInterestInVacancy } from "./graphql/save-interest.gen";
import { useMyUserAccess } from "reference-data/my-user-access";
import { compact } from "lodash-es";
import { isAfter, parseISO } from "date-fns";
import { AcceptResultDialog } from "ui/pages/sub-home/components/accept-result-dialog";

type Props = {};

export const SubSpecificOpportunity: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const params = useRouteParams(SubSpecificOpportunityRoute);
  const vacancyId = params.vacancyId;

  const isMobile = useIsMobile();

  const [acceptResultDialogOpen, setAcceptResultDialogOpen] = React.useState(
    false
  );
  const [assignmentId, setAssignmentId] = React.useState<string | null>(null);

  const [dismissVacancyMutation] = useMutationBundle(DismissVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [acceptVacancyMutation] = useMutationBundle(AcceptVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [saveInterest] = useMutationBundle(SaveInterestInVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const userAccess = useMyUserAccess();
  const orgUsers = compact(userAccess?.me?.user?.orgUsers) ?? [];

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: {
      vacancyId: vacancyId,
    },
  });

  const vacancy = useMemo(
    () =>
      getVacancy.state === "DONE" || getVacancy.state === "UPDATING"
        ? getVacancy.data.vacancy?.getVacancyByIdForSub ?? null
        : null,
    [getVacancy]
  );

  const employeeId = orgUsers.find(o => o.orgId === vacancy?.organization.id)
    ?.id;

  // If the user has already been assigned to this vacancy, route them to the specific assignment page
  useEffect(() => {
    const vacancyAssignmentId = vacancy?.details.find(
      d => d.assignment && d.assignment.employeeId === employeeId
    )?.assignmentId;
    if (vacancyAssignmentId) {
      history.push(
        SubSpecificAssignmentRoute.generate({
          assignmentId: vacancyAssignmentId,
        })
      );
    }
  }, [employeeId, history, vacancy]);

  const onDismissVacancy = async (vacancyId: string) => {
    if (employeeId) {
      await Promise.resolve(
        dismissVacancyMutation({
          variables: {
            vacancyRejection: {
              vacancyId: vacancyId,
              employeeId: employeeId,
            },
          },
        })
      );
    }
    history.push(SubHomeRoute.generate(params));
  };

  const onSaveInterest = async (vacancyId: string) => {
    if (employeeId) {
      await Promise.resolve(
        saveInterest({
          variables: {
            vacancyInterest: {
              vacancyId: vacancyId,
              employeeId: employeeId,
            },
          },
        })
      );
    }
    history.push(SubHomeRoute.generate(params));
  };

  const onCloseAcceptResultDialog = async () => {
    setAcceptResultDialogOpen(false);
    let route = SubHomeRoute.generate(params);
    if (assignmentId) {
      route = SubSpecificAssignmentRoute.generate({ assignmentId });
    }
    setAssignmentId(null);
    history.push(route);
  };

  const onAcceptVacancy = async (vacancyId: string) => {
    if (employeeId) {
      const result = await acceptVacancyMutation({
        variables: {
          vacancyAccept: {
            vacancyId: vacancyId,
            employeeId: employeeId,
          },
        },
      });
      if (result?.data?.vacancy?.acceptVacancy?.id) {
        setAssignmentId(result.data.vacancy.acceptVacancy.id);
      }
      if (result?.data) {
        setAcceptResultDialogOpen(true);
      }
    }
  };

  const employeeInterest = compact(vacancy?.interestedEmployees ?? []).find(
    x => x?.employeeId === employeeId
  );
  const canAcceptVacancy = vacancy?.details?.some(
    d => !d.assignmentId && isAfter(parseISO(d.startTimeLocal), new Date())
  );

  const DismissAndAcceptButtons = (
    <>
      <Grid item>
        <Button
          variant={isMobile ? "text" : "outlined"}
          onClick={() => onDismissVacancy(vacancy?.id ?? "")}
        >
          {canAcceptVacancy ? t("Dismiss") : t("No")}
        </Button>
      </Grid>

      <Grid item>
        {canAcceptVacancy ? (
          <Button
            variant="contained"
            onClick={() => onAcceptVacancy(vacancy?.id ?? "")}
          >
            {t("Accept")}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => onSaveInterest(vacancy?.id ?? "")}
          >
            {t("Yes")}
          </Button>
        )}
      </Grid>
    </>
  );

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
                    {t("Assignment is no longer available")}
                  </Typography>
                  <Link
                    onClick={() => history.push(SubHomeRoute.generate(params))}
                  >
                    {t("Search for assignments")}
                  </Link>
                </Grid>
              ) : (
                <>
                  {!canAcceptVacancy && (
                    <>
                      {employeeInterest?.isInterested ? (
                        <Grid item xs={isMobile ? 12 : 10}>
                          <Typography variant="h5">
                            {t(
                              "You have expressed interest in this assignment."
                            )}
                          </Typography>
                        </Grid>
                      ) : employeeInterest?.isRejected ? (
                        <Grid item xs={isMobile ? 12 : 10}>
                          <Typography variant="h5">
                            {t("You have dismissed this assignment.")}
                          </Typography>
                        </Grid>
                      ) : (
                        <>
                          <Grid item xs={isMobile ? 12 : 10}>
                            <Typography variant="h5">
                              {t(
                                "Unfortunately, this assignment is no longer available.  Would you have been interested in accepting this assignment?"
                              )}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            container
                            justify="flex-end"
                            alignItems="flex-end"
                            spacing={2}
                            xs={isMobile ? 12 : 2}
                          >
                            {DismissAndAcceptButtons}
                          </Grid>
                        </>
                      )}
                    </>
                  )}
                  <Grid item xs={12}>
                    <AvailableJob
                      vacancy={vacancy}
                      shadeRow={false}
                      onDismiss={onDismissVacancy}
                      onAccept={onAcceptVacancy}
                      forSingleJob={true}
                    />
                  </Grid>
                  <Grid item xs={isMobile ? 12 : 6}>
                    {vacancy?.notesToReplacement && (
                      <>
                        <Typography variant="h6">{t("Notes")}</Typography>
                        <div>{vacancy?.notesToReplacement}</div>
                      </>
                    )}
                  </Grid>
                  {!isMobile &&
                    canAcceptVacancy &&
                    !employeeInterest?.isInterested &&
                    !employeeInterest?.isRejected && (
                      <Grid
                        item
                        container
                        justify="flex-end"
                        alignItems="flex-end"
                        spacing={2}
                        xs={6}
                      >
                        {DismissAndAcceptButtons}
                      </Grid>
                    )}
                </>
              )}
            </Grid>
          </Section>
        </Grid>
      </Grid>
      {isMobile &&
        canAcceptVacancy &&
        !employeeInterest?.isInterested &&
        !employeeInterest?.isRejected && (
          <Section>
            <Grid container justify="space-between" alignItems="flex-end">
              {DismissAndAcceptButtons}
            </Grid>
          </Section>
        )}

      <AcceptResultDialog
        open={acceptResultDialogOpen}
        assignmentId={assignmentId}
        onClose={onCloseAcceptResultDialog}
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
