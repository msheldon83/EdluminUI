import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize, useBreakpoint } from "hooks";
import { Typography, Divider, Tab, Tabs } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { makeStyles, Grid } from "@material-ui/core";
import { Redirect, useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { TextButton } from "ui/components/text-button";
import { useState } from "react";
import { PersonViewHeader } from "./components/view-header";
import { UpdateOrgUser } from "./graphql/update-orguser.gen";
import { UpdateEmployee } from "./graphql/update-employee.gen";

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
import { OrgUserRole } from "graphql/server-types.gen";
import { GetOrgUserLastLogin } from "./graphql/get-orguser-lastlogin.gen";
import { formatIsoDateIfPossible } from "helpers/date";

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

  const getOrgUserLastLogin = useQueryBundle(GetOrgUserLastLogin, {
    variables: { id: params.orgUserId },
  });

  if (
    getOrgUser.state === "LOADING" ||
    getOrgUserLastLogin.state === "LOADING"
  ) {
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
  const lastLogin =
    getOrgUserLastLogin?.data?.orgUser?.lastLoginById?.lastLogin;

  const formattedLoginTime = formatIsoDateIfPossible(
    lastLogin ? lastLogin : "Not Available",
    "MMM d, yyyy h:m a"
  );

  const formattedBirthDate = formatIsoDateIfPossible(
    orgUser.dateOfBirth ? orgUser.dateOfBirth : "Not Specified",
    "MMM d, yyyy"
  );

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
      <PersonViewHeader
        orgUser={orgUser}
        editing={editing}
        active={active}
        setEditing={setEditing}
        setActive={setActive}
        updateName={updateName}
        updateExternalId={updateExternalId}
        deleteOrgUser={deleteOrgUser}
        activateDeactivateOrgUser={activateDeactivateOrgUser}
      />
      <Tabs
        value={OrgUserRole.Administrator}
        indicatorColor="primary"
        textColor="primary"
        //onChange={updateRoleFilter}
        aria-label="person-role-selector"
      >
        {orgUser.isAdmin && (
          <Tab
            label={t("Admin")}
            value={OrgUserRole.Administrator}
            className={classes.tab}
          />
        )}
        {orgUser.isEmployee && (
          <Tab
            label={t("Employee")}
            value={OrgUserRole.Employee}
            className={classes.tab}
          />
        )}
        {orgUser.isReplacementEmployee && (
          <Tab
            label={t("Substitute")}
            value={OrgUserRole.ReplacementEmployee}
            className={classes.tab}
          />
        )}
        <span className={classes.selectableTab}>
          {!orgUser.isAdmin && (
            <Tab
              label={t("Admin")}
              value={OrgUserRole.Administrator}
              className={classes.tab}
            />
          )}
          {!orgUser.isEmployee && (
            <Tab
              label={t("Employee")}
              value={OrgUserRole.Employee}
              className={classes.tab}
            />
          )}
          {!orgUser.isReplacementEmployee && (
            <Tab
              label={t("Substitute")}
              value={OrgUserRole.ReplacementEmployee}
              className={classes.tab}
            />
          )}
        </span>
      </Tabs>
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
              <div>{formattedBirthDate}</div>
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
              <div>{formattedLoginTime}</div>
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
  tab: {
    textTransform: "uppercase",
  },
  selectableTab: {
    marginLeft: "auto",
    marginRight: -12,
  },
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));
