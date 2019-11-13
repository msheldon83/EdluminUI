import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize, useBreakpoint } from "hooks";
import { Typography, Divider } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import Maybe from "graphql/tsutils/Maybe";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { makeStyles, Grid } from "@material-ui/core";
import { Redirect, useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { TextButton } from "ui/components/text-button";
import { useState } from "react";
import * as yup from "yup";
import { UpdateOrgUser } from "./graphql/update-orguser.gen";
import { UpdateEmployee } from "./graphql/update-employee.gen";
import { PageHeader } from "ui/components/page-header";
import { getInitials } from "ui/components/helpers";
import {
  PageHeaderMultiField,
  FieldData,
} from "ui/components/page-header-multifieldedit";
import { DeleteOrgUser } from "./graphql/delete-orguser.gen";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";
import { AvatarCard } from "ui/components/avatar-card";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const PersonViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useScreenSize() === "mobile";
  const history = useHistory();
  const isSmDown = useBreakpoint("sm", "down");
  const params = useRouteParams(PersonViewRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [active, setActive] = useState<boolean | null>(null);

  const [resetPassword] = useMutationBundle(ResetPassword);
  const [deleteOrgUserMutation] = useMutationBundle(DeleteOrgUser);
  const deleteOrgUser = React.useCallback(() => {
    history.push(PeopleRoute.generate(params));
    return deleteOrgUserMutation({
      variables: {
        orgUserId: Number(params.orgUserId),
      },
    });
  }, [deleteOrgUserMutation, history, params]);

  const [updateEmployee] = useMutationBundle(UpdateEmployee);
  const [updateOrgUser] = useMutationBundle(UpdateOrgUser);
  const activateDeactivateOrgUser = React.useCallback(
    (active: boolean, rowVersion: string) => {
      return updateOrgUser({
        variables: {
          orgUser: {
            id: Number(params.orgUserId),
            rowVersion: rowVersion,
            active: !active,
          },
        },
      });
    },
    [updateOrgUser, params]
  );

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  if (getOrgUser.state === "LOADING") {
    return <></>;
  }

  const orgUser = getOrgUser?.data?.orgUser?.byId;
  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const onResetPassword = async () => {
    await resetPassword({
      variables: { resetPasswordInput: { id: Number(orgUser.userId) } },
    });
  };

  const initials = getInitials(orgUser);
  const employee = orgUser.employee;

  let permissions = orgUser.isSuperUser ? t("Org Admin") : "";
  if (orgUser.permissionSets!.length > 0) {
    permissions =
      orgUser?.permissionSets?.map(p => p?.name).join(",") ??
      t("No Permissions Defined");
  }

  if (active === null) {
    setActive(orgUser.active);
  }

  const updateName = async (nameFields: FieldData[]) => {
    const lastName = nameFields.find(x => x.key === "lastName")?.value;
    const middleName = nameFields.find(x => x.key === "middleName")?.value;
    const firstName = nameFields.find(x => x.key === "firstName")?.value;

    await updateOrgUser({
      variables: {
        orgUser: {
          id: Number(orgUser.id),
          rowVersion: orgUser.rowVersion,
          lastName,
          firstName,
          middleName,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updateOrgUser({
      variables: {
        orgUser: {
          id: Number(orgUser.id),
          rowVersion: orgUser.rowVersion,
          externalId,
        },
      },
    });
  };

  return (
    <>
      <PageTitle title={t("Person")} withoutHeading={!isMobile} />
      <PageHeaderMultiField
        text={`${orgUser.firstName} ${
          orgUser.middleName ? `${orgUser.middleName} ` : ""
        }${orgUser.lastName}`}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
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
        onSubmit={async (value: Array<FieldData>) => {
          await updateName(value);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: active ? t("Inactivate") : t("Activate"),
            onClick: async () => {
              await activateDeactivateOrgUser(!active, orgUser.rowVersion);
              setActive(!active);
            },
          },
          {
            name: t("Delete"),
            onClick: deleteOrgUser,
          },
        ]}
        isInactive={!active}
        inactiveDisplayText={t("This person is currently inactive.")}
        onActivate={async () => {
          await activateDeactivateOrgUser(true, orgUser.rowVersion);
          setActive(true);
        }}
      />
      <PageHeader
        text={orgUser.externalId}
        label={t("External ID")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateExternalId(value);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />

      <Section>
        <SectionHeader
          title={t("Information")}
          action={{
            text: t("Edit"),
            visible: !editing,
            execute: () => {
              const editSettingsUrl = "/"; //TODO figure out the URL for editing
              history.push(editSettingsUrl);
            },
          }}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Email")}</Typography>
              <div>{orgUser.email}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Address")}</Typography>
              <div>
                {!orgUser.address1
                  ? t("Not specified")
                  : `${orgUser.address1}\n${orgUser.address2 &&
                      `${orgUser.address2}\n`}${orgUser.city}, ${
                      orgUser.state
                    } ${orgUser.postalCode}\n${orgUser.country}`}
              </div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Phone")}</Typography>
              <div>{orgUser.phoneNumber ?? t("Not specified")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Date of Birth")}</Typography>
              <div>{orgUser.dateOfBirth ?? t("Not specified")}</div>
            </Grid>
            <Grid item xs={12}>
              <Divider variant="middle" />
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Permissions")}</Typography>
              <div>{permissions}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Last Login")}</Typography>
              <Typography variant="h6">{"Nov 11, 2019 3:57 PM"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Username")}</Typography>
              <div>{orgUser.loginEmail}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Password")}</Typography>
              <TextButton onClick={() => onResetPassword()}>
                {t("Reset Password")}
              </TextButton>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={4}>
            <Grid
              item
              container={isSmDown}
              justify={isSmDown ? "center" : undefined}
            >
              <AvatarCard initials={initials} />
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));
