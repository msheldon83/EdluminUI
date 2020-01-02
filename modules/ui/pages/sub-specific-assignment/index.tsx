import { Button, Grid, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { PageTitle } from "ui/components/page-title";
import { OrgUser, Vacancy } from "graphql/server-types.gen";
import { compact } from "lodash-es";
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
import { SubSpecificAssignmentRoute } from "ui/routes/sub-specific-assignment";
import { CancelAssignment } from "ui/components/absence/graphql/cancel-assignment.gen";
import { RequestAbsenceDialog } from "ui/pages/sub-home/components/request-dialog";
import { DismissVacancy } from "ui/pages/sub-home/graphql/dismiss-vacancy.gen";
import { GetSpecificAssignment } from "./graphql/get-specific-assignment.gen";
import { RequestVacancy } from "ui/pages/sub-home/graphql/request-vacancy.gen";
import { QueryOrgUsers } from "ui/pages/sub-home/graphql/get-orgusers.gen";

import { AssignmentRow } from "ui/components/substitutes/assignment-row";
import { AssignmentGroup } from "ui/components/substitutes/assignment-row/assignment-group";

type Props = {};

export const SubSpecificAssignment: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const params = useRouteParams(SubSpecificAssignmentRoute);
  const assignmentId = params.assignmentId;

  const isMobile = useIsMobile();

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onCancelAssignment = async (
    assignmentId: string,
    rowVersion: string
  ) => {
    await cancelAssignment({
      variables: {
        cancelRequest: {
          assignmentId,
          rowVersion,
        },
      },
    });
    history.push(SubHomeRoute.generate(params));
  };

  const getOrgUsers = useQueryBundle(QueryOrgUsers, {
    fetchPolicy: "cache-first",
  });

  const userId =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user?.id;

  const getAssignment = useQueryBundle(GetSpecificAssignment, {
    variables: {
      id: userId,
      assignmentId: assignmentId,
    },
    skip: !userId,
  });

  const vacancyDetails = useMemo(() => {
    if (getAssignment.state === "DONE" || getAssignment.state === "UPDATING") {
      return compact(getAssignment.data.employee?.employeeSpecificAssignment);
    }
    return [];
  }, [getAssignment]);

  const assignmentNumber = vacancyDetails[0].assignment?.id
    ? `#C${vacancyDetails[0].assignment.id}`
    : "";

  return (
    <>
      <PageTitle title={`${t("Assignment")} ${assignmentNumber}`} />
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
              {getAssignment.state === "LOADING" ? (
                <Grid item>
                  <Typography variant="h5">
                    {t("Loading assignment")}
                  </Typography>
                </Grid>
              ) : vacancyDetails.length === 0 ? (
                <Grid item>
                  <Typography variant="h5">
                    {t("Assignment not available")}
                  </Typography>
                  <Link
                    onClick={() => history.push(SubHomeRoute.generate(params))}
                  >
                    {t("Home")}
                  </Link>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    {vacancyDetails.length > 1 ? (
                      <AssignmentGroup
                        vacancyDetails={vacancyDetails}
                        onCancel={onCancelAssignment}
                        isAdmin={false}
                      />
                    ) : (
                      <AssignmentRow
                        assignment={vacancyDetails[0]}
                        onCancel={onCancelAssignment}
                        isAdmin={false}
                      />
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">{t("Notes")}</Typography>
                    <div>{vacancyDetails[0].vacancy?.notesToReplacement}</div>
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
                        variant="outlined"
                        onClick={() =>
                          onCancelAssignment(
                            assignmentId,
                            vacancyDetails[0].assignment?.rowVersion ?? ""
                          )
                        }
                      >
                        {t("Cancel")}
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
          </Section>
        </Grid>
      </Grid>
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
