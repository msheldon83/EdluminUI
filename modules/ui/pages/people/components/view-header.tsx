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
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { OptionType } from "ui/components/form/select-new";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { OrgUserRole } from "graphql/server-types.gen";
import { OrganizationType, FeatureFlag } from "graphql/server-types.gen";
import { ShadowIndicator } from "ui/components/shadow-indicator";
import { DeleteDialog } from "ui/pages/people/components/delete-dialog";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
  secondaryIdentifier: "secondary-identifier",
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
    secondaryIdentifier?: string | null | undefined;
    inviteSent: boolean;
    isAccountSetup: boolean;
    isAdmin: boolean;
    isEmployee: boolean;
    isReplacementEmployee: boolean;
    isShadowRecord: boolean;
    shadowFromOrgName?: string | null | undefined;
    shadowFromOrgId?: string | null;
  };
  orgStatus?: OrganizationType | null | undefined;
  orgFeatureFlags?: Maybe<FeatureFlag>[] | null | undefined;
  selectedRole?: OrgUserRole | null;
  orgId: string;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  deleteOrgUser: () => Promise<unknown>;
  onSaveOrgUser: (orgUser: OrgUserUpdateInput) => Promise<unknown>;
  onRemoveRole: (orgUserRole: OrgUserRole) => Promise<any>;
};

export const PersonViewHeader: React.FC<Props> = props => {
  const orgUser = props.orgUser;

  const history = useHistory();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const [inviteSent, setInviteSent] = React.useState(
    orgUser.inviteSent || false
  );
  const [currentDialog, setCurrentDialog] = React.useState<
    "delete" | OrgUserRole | null
  >(null);
  const [now, setNow] = React.useState<Date>(new Date());

  const [inviteUser] = useMutationBundle(InviteSingleUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const canSeeSecondaryIdentifier = props.orgFeatureFlags?.includes(
    FeatureFlag.SecondaryIdentifier
  );

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

  const canEditThisOrgUser = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    canEditOrgUser(
      permissions,
      isSysAdmin,
      orgUser.isAdmin,
      orgUser.isEmployee,
      orgUser.isReplacementEmployee,
      orgUser.isShadowRecord,
      orgId,
      orgUser.shadowFromOrgId,
      forRole
    );

  const canDeleteThisOrgUser = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    canDeleteOrgUser(
      permissions,
      isSysAdmin,
      orgUser.isAdmin,
      orgUser.isEmployee,
      orgUser.isReplacementEmployee,
      orgId,
      orgUser.isShadowRecord,
      forRole
    );

  const editable = props.editing === null;

  const buildActionMenu = React.useCallback(() => {
    // setup 3 dot menu actions
    let menuActions = [];
    if (props.selectedRole === OrgUserRole.Employee && orgUser.active) {
      menuActions.push({
        name: t("Create Absence"),
        onClick: () => {
          history.push(
            AdminCreateAbsenceRoute.generate({
              organizationId: props.orgId,
              employeeId: orgUser.id,
            })
          );
        },
        permissions: [PermissionEnum.AbsVacSave],
      });
    }
    if (orgUser.active) {
      menuActions.push({
        name: t("Impersonate"),
        onClick: async () => await triggerImpersonation(),
        permissions: [PermissionEnum.OrgUserImpersonate],
      });
    }
    menuActions.push({
      name: t("Change History"),
      onClick: () => {},
    });
    menuActions.push({
      name: orgUser.active ? t("Inactivate") : t("Activate"),
      onClick: async () => {
        await props.onSaveOrgUser({
          rowVersion: orgUser.rowVersion,
          id: orgUser.id,
          active: !orgUser.active,
        });
      },
      permissions: canEditThisOrgUser,
    });
    if (orgUser.userId && orgUser.active && !orgUser.isShadowRecord) {
      menuActions.push({
        name: inviteSent ? t("Resend Invitation") : t("Invite"),
        onClick: invite,
        permissions: [PermissionEnum.OrgUserInvite],
      });
    }
    menuActions.push({
      name: t("Delete"),
      onClick: () => {
        setNow(new Date());
        setCurrentDialog("delete");
      },
      permissions: canDeleteThisOrgUser,
    });

    const inactivateRoleOptions = [];
    if (orgUser.isAdmin) {
      inactivateRoleOptions.push({
        name: t("Remove admin access"),
        onClick: () => {
          setNow(new Date());
          setCurrentDialog(OrgUserRole.Administrator);
        },
        permissions: canDeleteThisOrgUser,
      });
    }
    if (orgUser.isEmployee) {
      inactivateRoleOptions.push({
        name: t("Remove employee access"),
        onClick: () => {
          setNow(new Date());
          setCurrentDialog(OrgUserRole.Employee);
        },
        permissions: canDeleteThisOrgUser,
      });
    }
    if (orgUser.isReplacementEmployee) {
      inactivateRoleOptions.push({
        name: t("Remove substitute access"),
        onClick: () => {
          setNow(new Date());
          setCurrentDialog(OrgUserRole.ReplacementEmployee);
        },
        permissions: canDeleteThisOrgUser,
      });
    }
    if (inactivateRoleOptions.length > 1) {
      menuActions = menuActions.concat(inactivateRoleOptions);
    }

    return menuActions;
    /* eslint-disable-next-line */
  }, [props.selectedRole, orgUser, props.orgId]);

  const triggerImpersonation = async () => {
    // Set userId in sessionStorage
    if (orgUser.userId) {
      sessionStorage.setItem(
        Config.impersonation.actingUserIdKey,
        orgUser.userId
      );
      sessionStorage.setItem(
        Config.impersonation.actingOrgUserIdKey,
        orgUser.id
      );
      sessionStorage.setItem(
        Config.impersonation.impersonatingOrgId,
        props.orgId
      );
      // Redirect current user to homepage
      history.push("/");
    }
  };

  const onAccept =
    currentDialog == "delete"
      ? props.deleteOrgUser
      : currentDialog == null
      ? () => {}
      : async () => {
          await props.onRemoveRole(currentDialog);
          setCurrentDialog(null);
        };
  const onCancel = () => setCurrentDialog(null);

  return (
    <>
      <DeleteDialog
        type={currentDialog}
        now={now}
        onAccept={onAccept}
        onCancel={onCancel}
        orgId={props.orgId}
        orgUser={orgUser}
      />
      <PageHeaderMultiField
        text={`${orgUser.firstName} ${
          orgUser.middleName ? `${orgUser.middleName} ` : ""
        }${orgUser.lastName}`}
        label={t("Name")}
        editable={editable}
        onEdit={() => props.setEditing(editableSections.name)}
        editPermissions={canEditThisOrgUser}
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
        actions={buildActionMenu()}
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
        label={t("Identifier")}
        editable={editable}
        onEdit={() => props.setEditing(editableSections.externalId)}
        editPermissions={canEditThisOrgUser}
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
      >
        <ShadowIndicator
          orgName={orgUser.shadowFromOrgName}
          isShadow={orgUser.isShadowRecord}
        />
      </PageHeader>
      {canSeeSecondaryIdentifier && (
        <PageHeader
          text={orgUser.secondaryIdentifier}
          label={t("Secondary Identifier")}
          editable={editable}
          onEdit={() => props.setEditing(editableSections.secondaryIdentifier)}
          editPermissions={canEditThisOrgUser}
          validationSchema={yup.object().shape({
            value: yup.string().nullable(),
          })}
          onSubmit={async (value: Maybe<string>) => {
            await props.onSaveOrgUser({
              rowVersion: orgUser.rowVersion,
              id: orgUser.id,
              secondaryIdentifier: value,
            });
          }}
          onCancel={() => props.setEditing(null)}
          isSubHeader={true}
          showLabel={true}
        >
          <ShadowIndicator
            orgName={orgUser.shadowFromOrgName}
            isShadow={orgUser.isShadowRecord}
          />
        </PageHeader>
      )}
    </>
  );
};
