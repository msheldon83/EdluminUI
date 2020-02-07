import * as React from "react";
import { PageHeader } from "ui/components/page-header";
import {
  PageHeaderMultiField,
  FieldData,
} from "ui/components/page-header-multifieldedit";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import Maybe from "graphql/tsutils/Maybe";
import { OrgUserUpdateInput, PermissionEnum } from "graphql/server-types.gen";
import { useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { InviteSingleUser } from "../graphql/invite-single-user.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { canEditOrgUser, canDeleteOrgUser } from "helpers/permissions";
import { OrgUserPermissions } from "ui/components/auth/types";
import { OptionType } from "ui/components/form/select-new";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { OrgUserRole } from "graphql/server-types.gen";
import { OrganizationType } from "graphql/server-types.gen";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

type Props = {
  editing: string | null;
  orgUser: {
    id: string;
    orgId: string;
    userId?: string | null | undefined;
    active: boolean;
    firstName: string;
    middleName?: string | null | undefined;
    lastName: string;
    rowVersion: string;
    externalId?: string | null | undefined;
    inviteSent: boolean;
    isAccountSetup: boolean;
    isAdmin: boolean;
    isEmployee: boolean;
    isReplacementEmployee: boolean;
  };
  orgStatus?: OrganizationType | null | undefined;
  selectedRole?: OrgUserRole | null;
  orgId: string;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  deleteOrgUser: () => Promise<unknown>;
  onSaveOrgUser: (orgUser: OrgUserUpdateInput) => Promise<unknown>;
};

export const PersonViewHeader: React.FC<Props> = props => {
  const orgUser = props.orgUser;
  const history = useHistory();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const [inviteSent, setInviteSent] = React.useState(
    orgUser.inviteSent || false
  );

  const [inviteUser] = useMutationBundle(InviteSingleUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const orgStatus = props.orgStatus;
  const invite = React.useCallback(async () => {
    if (orgStatus === OrganizationType.Demo) {
      openSnackbar({
        message: t("This Organization is in Demo Mode. Invite was not sent"),
        dismissable: true,
        status: "info",
        autoHideDuration: 5000,
      });
    } else {
      const response = await inviteUser({
        variables: {
          userId: orgUser.userId!,
          orgId: orgUser.orgId,
        },
      });
      const result = response?.data?.user?.invite;
      if (result) {
        openSnackbar({
          message: t("The invite has been sent"),
          dismissable: true,
          status: "success",
          autoHideDuration: 5000,
        });
        if (!inviteSent) {
          setInviteSent(true);
        }
      }
    }
  }, [
    orgStatus,
    openSnackbar,
    t,
    inviteUser,
    orgUser.userId,
    orgUser.orgId,
    inviteSent,
  ]);

  return (
    <>
      <PageHeaderMultiField
        text={`${orgUser.firstName} ${
          orgUser.middleName ? `${orgUser.middleName} ` : ""
        }${orgUser.lastName}`}
        label={t("Name")}
        editable={props.editing === null}
        onEdit={() => props.setEditing(editableSections.name)}
        editPermissions={(
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string
        ) =>
          canEditOrgUser(
            permissions,
            isSysAdmin,
            orgUser.isAdmin,
            orgUser.isEmployee,
            orgUser.isReplacementEmployee,
            orgId
          )
        }
        validationSchema={yup.object().shape({
          firstName: yup.string().required(t("First name is required")),
          middleName: yup.string().nullable(),
          lastName: yup.string().required(t("Last name is required")),
        })}
        fields={[
          {
            key: "firstName",
            value: orgUser.firstName,
            label: t("First Name"),
          },
          {
            key: "middleName",
            value: orgUser.middleName,
            label: t("Middle Name"),
          },
          {
            key: "lastName",
            value: orgUser.lastName,
            label: t("Last Name"),
          },
        ]}
        onSubmit={async (values: Array<FieldData>) => {
          await props.onSaveOrgUser({
            rowVersion: orgUser.rowVersion,
            id: orgUser.id,
            firstName: values.find(x => x.key === "firstName")?.value,
            lastName: values.find(x => x.key === "lastName")?.value,
            middleName: values.find(x => x.key === "middleName")?.value,
          });
        }}
        onCancel={() => props.setEditing(null)}
        actions={[
          ...[
            ...(props.selectedRole === OrgUserRole.Employee && orgUser.active
              ? [
                  {
                    name: t("Create Absence"),
                    onClick: () => {
                      history.push(
                        AdminCreateAbsenceRoute.generate({
                          organizationId: props.orgId,
                          employeeId: props.orgUser.id,
                        })
                      );
                    },
                    permissions: [PermissionEnum.AbsVacSave],
                  },
                ]
              : []),

            {
              name: t("Change History"),
              onClick: () => {},
            },
            {
              name: orgUser.active ? t("Inactivate") : t("Activate"),
              onClick: async () => {
                await props.onSaveOrgUser({
                  rowVersion: orgUser.rowVersion,
                  id: orgUser.id,
                  active: !orgUser.active,
                });
              },
              permissions: (
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string
              ) =>
                canEditOrgUser(
                  permissions,
                  isSysAdmin,
                  orgUser.isAdmin,
                  orgUser.isEmployee,
                  orgUser.isReplacementEmployee,
                  orgId
                ),
            },
          ],
          ...(orgUser.userId && orgUser.active
            ? [
                {
                  name: inviteSent ? t("Resend Invitation") : t("Invite"),
                  onClick: invite,
                  permissions: [PermissionEnum.OrgUserInvite],
                },
              ]
            : []),
          {
            name: t("Delete"),
            onClick: props.deleteOrgUser,
            permissions: (
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string
            ) =>
              canDeleteOrgUser(
                permissions,
                isSysAdmin,
                orgUser.isAdmin,
                orgUser.isEmployee,
                orgUser.isReplacementEmployee,
                orgId
              ),
          },
        ]}
        isInactive={!orgUser.active}
        inactiveDisplayText={t("This person is currently inactive.")}
        onActivate={async () => {
          await props.onSaveOrgUser({
            rowVersion: orgUser.rowVersion,
            id: orgUser.id,
            active: !orgUser.active,
          });
        }}
      />
      <PageHeader
        text={orgUser.externalId}
        label={t("External ID")}
        editable={props.editing === null}
        onEdit={() => props.setEditing(editableSections.externalId)}
        editPermissions={(
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string
        ) =>
          canEditOrgUser(
            permissions,
            isSysAdmin,
            orgUser.isAdmin,
            orgUser.isEmployee,
            orgUser.isReplacementEmployee,
            orgId
          )
        }
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await props.onSaveOrgUser({
            rowVersion: orgUser.rowVersion,
            id: orgUser.id,
            externalId: value,
          });
        }}
        onCancel={() => props.setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />
    </>
  );
};
