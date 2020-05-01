import {
  Button,
  IconButton,
  makeStyles,
  Grid,
  Chip,
  Typography,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import PlayForWork from "@material-ui/icons/PlayForWork";
import { usePagedQueryBundle } from "graphql/hooks";
import { useIsMobile, useDeferredState } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, Redirect, useHistory } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { Table } from "ui/components/table";
import { AllOrganizations } from "ui/pages/organizations/graphql/AllOrganizations.gen";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";
import { UsersRoute } from "ui/routes/users";
import { OrganizationAddRoute } from "ui/routes/organizations";
import { canViewAsSysAdmin } from "helpers/permissions";
import { Can } from "ui/components/auth/can";
import { OrganizationType } from "graphql/server-types.gen";
import { Input } from "ui/components/form/input";
import { FilterQueryParams } from "./helpers/filter-params";
import {
  useQueryParamIso,
  makeQueryIso,
  PaginationParams,
} from "hooks/query-params";

type Props = { redirectIfOneOrg?: boolean };

export const OrganizationsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const history = useHistory();
  const userParams = useRouteParams(UsersRoute);
  const orgParams = useRouteParams(OrganizationAddRoute);

  const columns: Column<AllOrganizations.Results>[] = [
    { title: t("Id"), field: "id", sorting: false },
    {
      title: t("Name"),
      field: "name",
      sorting: false,
      render: (rowData: AllOrganizations.Results) => {
        return (
          <div>
            <Typography display="inline">{rowData.name}</Typography>{" "}
            {rowData.config?.organizationTypeId ===
              OrganizationType.Implementing && (
              <Chip
                tabIndex={-1}
                className={classes.implementingChip}
                label={t("Implementing")}
              />
            )}
            {rowData.config?.organizationTypeId === OrganizationType.Demo && (
              <Chip
                tabIndex={-1}
                className={classes.demoChip}
                label={t("Demo")}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "",
      field: "actions",
      sorting: false,
      render: (rowData: AllOrganizations.Results) => {
        const switchOrg = () => {
          return (
            <div className={classes.switchAlign}>
              {isMobile ? (
                <IconButton
                  component={Link}
                  to={AdminHomeRoute.generate({
                    organizationId: rowData.id.toString(),
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
                      organizationId: rowData.id.toString(),
                    })}
                  >
                    {t("Select")}
                  </Button>
                  <IconButton
                    className={classes.switchColor}
                    component={Link}
                    to={AdminHomeRoute.generate({
                      organizationId: rowData.id.toString(),
                    })}
                    target={"_blank"}
                  >
                    <LaunchIcon />
                  </IconButton>
                </>
              )}
            </div>
          );
        };
        return switchOrg();
      },
    },
  ];

  const [isoFilters, updateIsoFilters] = useQueryParamIso(FilterQueryParams);

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(isoFilters.searchText, 200);

  /* Navigating in the browser will update the query params but not
    the state in the UI. Here we update the pending value if the
    param changed and disregarding value stored in state to keep them
    in sync. */
  React.useEffect(() => {
    if (searchText !== isoFilters.searchText) {
      setPendingSearchText(isoFilters.searchText);
    }
  }, [isoFilters.searchText]); // eslint-disable-line

  /* As the value changes, update query params */
  React.useEffect(() => {
    if (searchText !== isoFilters.searchText) {
      updateIsoFilters({ searchText });
    }
  }, [searchText]); // eslint-disable-line

  const updateNameFilter = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

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
        ...isoFilters,
      },
    },
    orgPaginationDefaults
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
    searchText == undefined
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
        <Table
          // It is possible that if a user is an admin in multiple orgs and a sub in different orgs, this count will be wrong, but this is probably an unlikely scenario
          title={`${pagination.totalCount} Records`}
          columns={columns}
          data={organizations}
          selection={false}
          options={{
            showTitle: !isMobile,
          }}
          pagination={pagination}
        />
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
}));
