import * as React from "react";
import {
  PeopleRoute,
  AdminAddRoute,
  EmployeeAddRoute,
  SubstituteAddRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { MenuButton } from "ui/components/menu-button";
import { PermissionEnum } from "graphql/server-types.gen";
import {
  canCreateAdmin,
  canCreateEmployee,
  canCreateSubstitute,
} from "helpers/permissions";
import { OrgUserPermissions, Role } from "ui/components/auth/types";

export const CreateButton: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const history = useHistory();

  return (
    <div>
      <MenuButton
        selectedIndex={0}
        options={[
          {
            name: t("Add person"),
          },
          {
            name: t("Employee"),
            onClick: () =>
              history.push(
                EmployeeAddRoute.generate({
                  organizationId: params.organizationId,
                  orgUserId: "new",
                })
              ),
            permissions: (
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string,
              forRole?: Role | null | undefined
            ) => canCreateEmployee(permissions, isSysAdmin, orgId, forRole),
          },
          {
            name: t("Substitute"),
            onClick: () =>
              history.push(
                SubstituteAddRoute.generate({
                  organizationId: params.organizationId,
                  orgUserId: "new",
                })
              ),
            permissions: (
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string,
              forRole?: Role | null | undefined
            ) => canCreateSubstitute(permissions, isSysAdmin, orgId, forRole),
          },
          {
            name: t("Admin"),
            onClick: () =>
              history.push(
                AdminAddRoute.generate({
                  organizationId: params.organizationId,
                  orgUserId: "new",
                })
              ),
            permissions: (
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string,
              forRole?: Role | null | undefined
            ) => canCreateAdmin(permissions, isSysAdmin, orgId, forRole),
          },
        ]}
      />
    </div>
  );
};
