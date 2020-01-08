import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { compact } from "lodash-es";
import { SecurityPermissionSetsRoute } from "ui/routes/security/permission-sets";
import { useRouteParams } from "ui/routes/definition";
import { GetAllLocationGroupsWithinOrg } from "./graphql/get-all-location-groups.gen";
import { useIsMobile } from "hooks";
import { OrgUserRoles } from "reference-data/org-user-roles";
import { OrgUserRole } from "graphql/server-types.gen";

type Props = {
  olderAction?: () => void;
};

export const LocationsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useIsMobile();
  const params = useRouteParams(SecurityPermissionSetsRoute);

  const getLocationGroups = useQueryBundle(GetAllLocationGroupsWithinOrg, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const orgUserRoles = OrgUserRoles.reduce(
    (o: any, key: any) => ({ ...o, [key.enumValue]: key.name }),
    {}
  );

  const columns: Column<GetAllLocationGroupsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("Role"),
      field: "orgUserRole",
      type: "string",
      searchable: false,
      hidden: isMobile,
      lookup: orgUserRoles,
    },
    {
      title: t("Description"),
      field: "description",
      searchable: false,
      hidden: isMobile,
    },
  ];

  // if (getPermissionSets.state === "LOADING") {
  //   return <></>;
  // }

  // const permissionSets = compact(
  //   getPermissionSets?.data?.permissionSet?.all ?? []
  // );
  // const permissionSetsCount = permissionSets.length;

  return (
    <>
      <Section>
        {/* <Table
          title={`${permissionSetsCount} ${t("Permission Sets")}`}
          columns={columns}
          data={permissionSets}
          selection={false}
          onRowClick={(event, permissionSet) => {
            if (!permissionSet) return;
            const newParams = {
              ...params,
              permissionSet: permissionSet.id,
            };
            //history.push(NEW_ROUTE_HERE.generate(newParams)); TODO: Create Route for Permission Set View
          }}
        /> */}
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
