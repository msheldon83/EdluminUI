import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { compact } from "lodash-es";
import {
  SecurityPermissionSetsRoute,
  SecurityPermissionSetsViewRoute,
} from "ui/routes/security/permission-sets";
import { useRouteParams } from "ui/routes/definition";
import { GetAllPermissionSetsWithinOrg } from "./graphql/get-all-permission-sets.gen";
import { useIsMobile } from "hooks";
import { OrgUserRoles } from "reference-data/org-user-roles";
import { OrgUserRole } from "graphql/server-types.gen";

type Props = {
  rolesFilter?: OrgUserRole[];
  searchText?: string;
};

export const PermissionSetUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useIsMobile();
  const params = useRouteParams(SecurityPermissionSetsRoute);

  const getPermissionSets = useQueryBundle(GetAllPermissionSetsWithinOrg, {
    variables: {
      orgId: params.organizationId,
      roles: props.rolesFilter,
      searchText: props.searchText,
    },
  });

  const orgUserRoles = OrgUserRoles.reduce(
    (o: any, key: any) => ({ ...o, [key.enumValue]: key.name }),
    {}
  );

  const columns: Column<GetAllPermissionSetsWithinOrg.All>[] = [
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
      title: t("External ID"),
      field: "externalId",
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("Description"),
      field: "description",
      searchable: false,
      hidden: isMobile,
    },
  ];

  if (getPermissionSets.state === "LOADING") {
    return <></>;
  }

  const permissionSets = compact(
    getPermissionSets?.data?.permissionSet?.all ?? []
  );
  const permissionSetsCount = permissionSets.length;

  return (
    <>
      <Section>
        <Table
          title={`${permissionSetsCount} ${t("Permission Sets")}`}
          columns={columns}
          data={permissionSets}
          selection={false}
          onRowClick={(event, permissionSet) => {
            if (!permissionSet) return;
            const newParams = {
              ...params,
              permissionSetId: permissionSet.id,
            };
            history.push(SecurityPermissionSetsViewRoute.generate(newParams));
          }}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
