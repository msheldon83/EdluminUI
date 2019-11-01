import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { AllOrganizations } from "ui/pages/organizations/AllOrganizations.gen";
import * as React from "react";
import { useMemo } from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { GetOrgsForUser } from "ui/pages/organizations/GetOrgsForUser.gen";
import { Link } from "react-router-dom";
import { makeStyles, IconButton, Button } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import PlayForWork from "@material-ui/icons/PlayForWork";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { compact } from "lodash-es";
import { useScreenSize } from "hooks";
import { Column } from "material-table";
import { PaginationControls } from "ui/components/pagination-controls";

type Props = {};
export const OrganizationsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  const columns: Column<GetOrgsForUser.Organization>[] = [
    { title: t("Id"), field: "id" },
    { title: t("Name"), field: "name", defaultSort: "asc" },
    {
      title: "",
      field: "actions",
      sorting: false,
      render: (rowData: GetOrgsForUser.Organization) => {
        const switchOrg = () => {
          return (
            <div className={classes.switchAlign}>
              { isMobile ?
                <IconButton
                  component={Link}
                  to={AdminChromeRoute.generate({
                    organizationId: rowData.id.toString()
                  })}
                >
                  <PlayForWork />
                </IconButton>
                :
                <>
                  <Button
                    variant="contained"
                    className={classes.switchButton}
                    component={Link}
                    to={AdminChromeRoute.generate({
                      organizationId: rowData.id.toString()
                    })}
                  >
                    {t("Select")}
                  </Button>
                  <IconButton
                    className={classes.switchColor}
                    component={Link}
                    to={AdminChromeRoute.generate({
                      organizationId: rowData.id.toString()
                    })}
                    target={"_blank"}
                  >
                    <LaunchIcon />
                  </IconButton>
                </>
              }
            </div>
          );
        };
        return switchOrg();
      },
    },
  ];

  const orgUserQuery = useQueryBundle(GetOrgsForUser, {
    fetchPolicy: "cache-and-network",
  });

  const [getOrganizations, pagination] = usePagedQueryBundle(AllOrganizations, 
    r => r.organization?.paged?.totalCount,
    {
      variables: {},
      fetchPolicy: "cache-and-network",
  });

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

  return (
    <>
      <PageTitle title={t("Organizations")} />
      <Table
        title={!isMobile && `${organizationsCount} Records`}
        columns={columns}
        data={organizations}
        selection={!isMobile}
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
