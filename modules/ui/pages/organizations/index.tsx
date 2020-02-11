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
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, Redirect, useHistory } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { Table } from "ui/components/table";
import { AllOrganizations } from "ui/pages/organizations/AllOrganizations.gen";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useRouteParams } from "ui/routes/definition";
import { UsersRoute } from "ui/routes/users";
import { canViewAsSysAdmin } from "helpers/permissions";
import { Can } from "ui/components/auth/can";
import { OrganizationType } from "graphql/server-types.gen";

type Props = { redirectIfOneOrg?: boolean };

export const OrganizationsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const history = useHistory();
  const params = useRouteParams(UsersRoute);

  const columns: Column<AllOrganizations.Results>[] = [
    { title: t("Id"), field: "id" },
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
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

  const orgUserQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  const [getOrganizations, pagination] = usePagedQueryBundle(
    AllOrganizations,
    r => r.organization?.paged?.totalCount,
    {
      variables: {},
      fetchPolicy: "cache-and-network",
    }
  );

  const isSystemAdministrator =
    getOrganizations.state === "LOADING" || orgUserQuery.state === "LOADING"
      ? false
      : orgUserQuery?.data?.userAccess?.me?.isSystemAdministrator;
  const orgUsers =
    getOrganizations.state === "LOADING" || orgUserQuery.state === "LOADING"
      ? []
      : orgUserQuery?.data?.userAccess?.me?.user?.orgUsers || [];

  const isAdminInOrgs = useMemo(() => {
    return orgUsers.filter(r => r && r.isAdmin);
  }, [orgUsers]);

  let organizations = useMemo(() => {
    return compact(isAdminInOrgs.map(r => r && r.organization));
  }, [isAdminInOrgs]);

  if (
    getOrganizations.state === "LOADING" ||
    orgUserQuery.state === "LOADING"
  ) {
    return <></>;
  }

  let organizationsCount = organizations.length;

  if (isSystemAdministrator) {
    organizations = compact(
      getOrganizations?.data?.organization?.paged?.results ?? []
    );
    organizationsCount = pagination.totalCount;
  }

  if (organizationsCount === 1 && props.redirectIfOneOrg) {
    return (
      <Redirect
        to={AdminHomeRoute.generate({ organizationId: organizations[0].id })}
      />
    );
  }

  pagination.totalCount = organizationsCount;

  return (
    <>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <PageTitle title={t("Organizations")} />
        </Grid>
        <Grid item>
          <Can do={canViewAsSysAdmin}>
            <Button
              variant="outlined"
              onClick={() => {
                history.push(UsersRoute.generate(params));
              }}
            >
              {t("Users")}
            </Button>
          </Can>
        </Grid>
      </Grid>
      <Table
        title={`${organizationsCount} Records`}
        columns={columns}
        data={organizations}
        selection={!isMobile}
        options={{
          showTitle: !isMobile,
        }}
      />
      <PaginationControls pagination={pagination} />
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
}));
