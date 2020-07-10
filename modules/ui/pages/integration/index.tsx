import * as React from "react";
import { useHistory } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { parseAndFormat } from "../../components/date-helpers";
import {
  Grid,
  makeStyles,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Typography,
} from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { useSnackbar } from "hooks/use-snackbar";
import { useOrganizationId } from "core/org-context";
import { GetAllApplicationGrantsWithinOrg } from "./graphql/get-application-grants.gen";
import { IntegrationRoute, IntegrationViewRoute } from "ui/routes/integration";

type Props = {};

export const IntegrationList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const orgId = useOrganizationId();
  const history = useHistory();
  const params = useRouteParams(IntegrationRoute);

  const onRowClick = (id: string) => {
    history.push(
      IntegrationViewRoute.generate({
        ...params,
        applicationGrantId: id,
      })
    );
  };

  const appGrantsQuery = useQueryBundle(GetAllApplicationGrantsWithinOrg, {
    variables: { orgId: orgId },
  });

  if (appGrantsQuery.state === "LOADING") {
    return <></>;
  }

  const appGrants = compact(appGrantsQuery?.data?.applicationGrant?.all ?? []);
  return (
    <>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <PageTitle title={t("Integrations")} />
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Connections</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appGrants.map(grant => (
              <TableRow key={grant.id} onClick={() => onRowClick(grant.id)}>
                <TableCell>logo</TableCell>
                <TableCell>{grant.application?.name}</TableCell>
                <TableCell>{grant.connections.length}</TableCell>
                <TableCell>
                  {parseAndFormat(grant.createdLocal, "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
}));
