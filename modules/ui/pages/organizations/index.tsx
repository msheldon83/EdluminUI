import { Button, IconButton, makeStyles } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import PlayForWork from "@material-ui/icons/PlayForWork";
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, Redirect } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { Table } from "ui/components/table";
import { AllOrganizations } from "ui/pages/organizations/AllOrganizations.gen";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { AdminHomeRoute } from "ui/routes/admin-home";

type Props = { redirectIfOneOrg?: boolean };

export const OrganizationsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const columns: Column<GetMyUserAccess.Organization>[] = [
    { title: t("Id"), field: "id" },
    { title: t("Name"), field: "name", defaultSort: "asc" },
    {
      title: "",
      field: "actions",
      sorting: false,
      render: (rowData: GetMyUserAccess.Organization) => {
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

  return (
    <>
      <PageTitle title={t("Organizations")} />
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
}));
