import * as React from "react";
import { useHistory } from "react-router";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { parseAndFormat } from "../../components/date-helpers";
import {
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableHead,
} from "@material-ui/core";
import {
  StyledTableContainer,
  StyledTableRow,
  StyledTableCell,
} from "ui/components/styled-table";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { useSnackbar } from "hooks/use-snackbar";
import { useOrganizationId } from "core/org-context";
import { GetAllApplicationGrantsWithinOrg } from "./graphql/get-application-grants.gen";
import { IntegrationRoute, IntegrationViewRoute } from "ui/routes/integration";
import { ApplicationLogo } from "./components/application-logo";

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
      <StyledTableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell className={classes.logoColumn}></StyledTableCell>
              <StyledTableCell>Vendor</StyledTableCell>
              <StyledTableCell>Connections</StyledTableCell>
              <StyledTableCell>Created</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {appGrants.map(grant => (
              <StyledTableRow
                key={grant.id}
                onClick={() => onRowClick(grant.id)}
                className={classes.clickable}
              >
                <StyledTableCell className={classes.logoColumn}>
                  <div className={classes.logoBox}>
                    <ApplicationLogo
                      logo={grant.application?.logoUrlSmall}
                      isPrivate={!!grant.application?.orgId}
                    />
                  </div>
                </StyledTableCell>
                <StyledTableCell>{grant.application?.name}</StyledTableCell>
                <StyledTableCell>{grant.connections.length}</StyledTableCell>
                <StyledTableCell>
                  {parseAndFormat(grant.createdLocal, "MMM d, yyyy")}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  logoColumn: {
    maxWidth: 50,
    align: "center",
  },
  logoBox: {
    border: `1px solid ${theme.customColors.sectionBorder}`,
    padding: 3,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
    "& img": {
      width: "100%",
    },
    "& svg": {
      width: "100%",
    },
  },
  clickable: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.background.hoverRow,
    },
  },
}));
