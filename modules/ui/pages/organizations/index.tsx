import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { AllOrganizations } from "ui/pages/organizations/AllOrganizations.gen";
import { Organization } from "graphql/server-types.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { oc } from 'ts-optchain';
import { GetOrgsForUser } from "ui/pages/organizations/GetOrgsForUser.gen";
import { Link } from "react-router-dom";
import { makeStyles, Button, IconButton } from "@material-ui/core";
import LaunchIcon from '@material-ui/icons/Launch';

type Props = {};
export const OrganizationsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  
  const columns = [
    { title: t("OrgId"), field: "id" },
    { title: t("Name"), field: "name", defaultSort: "asc"},
    { title: "",
      field: "actions",
      sorting: false,
      render: (rowData: Organization) => {
        const switchOrg = () => {
          return (
            <div className={classes.switchAlign}>
              <Button
                variant="contained"
                className={classes.switchButton}
                component={Link}
                to={`/admin/${rowData.id}`}
              >{t("Select")}</Button>
            
              <IconButton
                className={classes.switchColor}
                component={Link}
                to={`/admin/${rowData.id}`} 
                target={"_blank"}
              ><LaunchIcon /></IconButton>
            </div>
          );
        };  
        return switchOrg();
      }
    }
  ];

  const orgUserQuery = useQueryBundle(GetOrgsForUser, {
    fetchPolicy: "cache-and-network",
  });

  const getOrganizations = useQueryBundle(AllOrganizations, {
    variables: { limit: 25, offset: 0 },  //TODO Figure out paging
    fetchPolicy: "cache-and-network",
  });
  
  if (getOrganizations.state === "LOADING" || orgUserQuery.state === "LOADING") {
    return <></>;
  }

  const isSystemAdministrator = oc(orgUserQuery).data.userAccess.me.isSystemAdministrator();
  const orgUsers = oc(orgUserQuery).data.userAccess.me.user.orgUsers([]);
  const isAdminInOrgs = orgUsers.filter(r => r && r.isAdmin);
  let organizations = isAdminInOrgs.map(r => r && r.organization);
  let organizationsCount = organizations.length;

  if (isSystemAdministrator) {
    organizations = oc(getOrganizations).data.organization.paged.results([]);
    organizationsCount = oc(getOrganizations).data.organization.paged.totalCount(0);
  } 

  return (
    <>
      <PageTitle title={t("Organizations")} />
      <Table
        title={`${organizationsCount} Records`}
        columns={columns}
        data={organizations}
        selection={true}
        paging={true}
      ></Table>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  switchButton: {
    backgroundColor: theme.customColors.lightBlue,
    borderRadius: theme.typography.pxToRem(4),
    fontFamily: theme.typography.fontFamily,
    color: theme.customColors.blue,
    textTransform: "uppercase"
  },
  switchColor: {
    color: theme.customColors.blue
  },
  switchAlign: {
    textAlign: "right"
  }
}));