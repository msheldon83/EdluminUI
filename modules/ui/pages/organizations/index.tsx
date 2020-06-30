import {
  Button,
  IconButton,
  makeStyles,
  Grid,
  Chip,
  Typography,
  withStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import PlayForWork from "@material-ui/icons/PlayForWork";
import { usePagedQueryBundle } from "graphql/hooks";
import { useIsMobile, useDeferredState } from "hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, Redirect, useHistory } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { AllOrganizations } from "ui/pages/organizations/graphql/AllOrganizations.gen";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";
import { UsersRoute } from "ui/routes/users";
import { OrganizationAddRoute } from "ui/routes/organizations";
import { canViewAsSysAdmin } from "helpers/permissions";
import { Can } from "ui/components/auth/can";
import { OrganizationType } from "graphql/server-types.gen";
import { Input } from "ui/components/form/input";
import { makeQueryIso, PaginationParams } from "hooks/query-params";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { PaginationControls } from "ui/components/pagination-controls";

type Props = { redirectIfOneOrg?: boolean };

export const OrganizationsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const history = useHistory();
  const userParams = useRouteParams(UsersRoute);
  const orgParams = useRouteParams(OrganizationAddRoute);

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>("", 200);

  const orgPaginationDefaults = makeQueryIso({
    defaults: {
      page: "1",
      limit: "100",
    },
    iso: PaginationParams,
  });

  const [getOrganizations, pagination] = usePagedQueryBundle(
    AllOrganizations,
    r => r.organization?.paged?.totalCount,
    {
      variables: {
        searchText,
      },
    },
    orgPaginationDefaults
  );

  const updateNameFilter = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
      pagination.resetPage();
    },
    [setPendingSearchText, pagination]
  );

  const organizations = useMemo(() => {
    if (
      getOrganizations.state === "DONE" ||
      getOrganizations.state === "UPDATING"
    ) {
      return compact(getOrganizations?.data?.organization?.paged?.results);
    }
    return [];
  }, [getOrganizations]);

  if (
    getOrganizations.state === "LOADING" ||
    !getOrganizations.data.organization?.paged?.results
  ) {
    return <></>;
  }

  const organizationsCount = pagination.totalCount;

  if (
    organizationsCount === 1 &&
    props.redirectIfOneOrg &&
    (searchText == undefined || searchText == "")
  ) {
    return (
      <Redirect
        to={AdminHomeRoute.generate({ organizationId: organizations[0].id })}
      />
    );
  }

  return (
    <>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <PageTitle title={t("Organizations")} />
        </Grid>
        <Grid item>
          <Can do={canViewAsSysAdmin}>
            <div className={classes.paddingRight}>
              <Button
                variant="outlined"
                onClick={() => {
                  history.push(OrganizationAddRoute.generate(orgParams));
                }}
              >
                {t("Create new org")}
              </Button>
            </div>
            <Button
              variant="outlined"
              onClick={() => {
                history.push(UsersRoute.generate(userParams));
              }}
            >
              {t("Users")}
            </Button>
          </Can>
        </Grid>
      </Grid>
      <div className={classes.searchTextField}>
        <Input
          label={t("Search")}
          value={pendingSearchText}
          onChange={updateNameFilter}
          placeholder={t("Name or Id")}
          fullWidth={true}
        />
      </div>
      <div className={classes.table}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={3} className={classes.recordCount}>
                  <Typography variant="h5">{`${organizationsCount} ${t(
                    "Records"
                  )}`}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <PaginationControls pagination={pagination} />
                </TableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell className={classes.idColumn}>
                  {t("Id")}
                </StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.map(row => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell className={classes.idColumn}>
                    {row.id}
                  </StyledTableCell>
                  <StyledTableCell>
                    <div>
                      <Typography display="inline">{row.name}</Typography>{" "}
                      {row.config?.organizationTypeId ===
                        OrganizationType.Implementing && (
                        <Chip
                          tabIndex={-1}
                          className={classes.implementingChip}
                          label={t("Implementing")}
                        />
                      )}
                      {row.config?.organizationTypeId ===
                        OrganizationType.Demo && (
                        <Chip
                          tabIndex={-1}
                          className={classes.demoChip}
                          label={t("Demo")}
                        />
                      )}
                    </div>
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className={classes.switchAlign}>
                      {isMobile ? (
                        <IconButton
                          component={Link}
                          to={AdminHomeRoute.generate({
                            organizationId: row.id.toString(),
                          })}
                        >
                          <PlayForWork />
                        </IconButton>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            className={classes.switchButton}
                            component={Link}
                            to={AdminHomeRoute.generate({
                              organizationId: row.id.toString(),
                            })}
                          >
                            {t("Select")}
                          </Button>
                          <IconButton
                            className={classes.switchColor}
                            component={Link}
                            to={AdminHomeRoute.generate({
                              organizationId: row.id.toString(),
                            })}
                            target={"_blank"}
                          >
                            <LaunchIcon />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              <StyledTableRow>
                <TableCell colSpan={3} align="right">
                  <PaginationControls pagination={pagination} />
                </TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  switchButton: {
    backgroundColor: theme.customColors.lightBlue,
    borderRadius: theme.typography.pxToRem(4),
    fontFamily: theme.typography.fontFamily,
    color: theme.customColors.sky,
    textTransform: "uppercase",
  },
  switchColor: {
    color: theme.customColors.sky,
  },
  switchAlign: {
    textAlign: "right",
  },
  implementingChip: {
    background: "#FFCC01",
    color: "#050039",
  },
  demoChip: {
    background: theme.customColors.mediumBlue,
    color: theme.customColors.white,
  },
  table: {
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    borderRadius: theme.typography.pxToRem(4),
  },
  searchTextField: {
    width: theme.typography.pxToRem(323),
    paddingBottom: theme.spacing(3),
  },
  paddingRight: {
    paddingRight: "10px",
    display: "inline",
  },
  idColumn: {
    width: theme.typography.pxToRem(100),
  },
  recordCount: {
    paddingLeft: theme.typography.pxToRem(24),
    paddingTop: theme.typography.pxToRem(12),
  },
}));

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderTop: `1px solid ${theme.customColors.sectionBorder}`,
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      color: `${theme.palette.secondary.main} !important`,
      fontSize: 14,
      fontWeight: "bold",
      paddingTop: 0,
    },
    body: {
      color: `${theme.palette.secondary.main} !important`,
    },
  })
)(TableCell);
