import {
  makeStyles,
  Grid,
  Button,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { Input } from "ui/components/form/input";
import { GetUserById } from "./graphql/get-user-by-id.gen";
import { UserViewRoute, UsersRoute } from "ui/routes/users";
import { useRouteParams } from "ui/routes/definition";
import { Formik } from "formik";
import { UpdateUser } from "./graphql/update-user.gen";
import * as yup from "yup";
import { ActionButtons } from "ui/components/action-buttons";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { useHistory } from "react-router";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { ResetUserPassword } from "./graphql/reset-user-password.gen";
import { InviteUser } from "./graphql/invite-user.gen";
import { ChangeLoginEmailDialog } from "../profile/components/change-email-dialog";
import { UpdateLoginEmail } from "../profile/graphql/UpdateLoginEmail.gen";
import { format, parseISO, isPast } from "date-fns";
import { Table } from "ui/components/table";
import { OrgUser } from "graphql/server-types.gen";
import { Column } from "material-table";
import { UserNotificationLogRoute } from "ui/routes/notification-log";
import { UserSmsLogRoute } from "ui/routes/sms-log";
import { phoneRegExp } from "helpers/regexp";

export const UserViewPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(UserViewRoute);
  const [orgUsers, setOrgUsers] = useState<
    Pick<
      OrgUser,
      | "id"
      | "isAdmin"
      | "isEmployee"
      | "isReplacementEmployee"
      | "active"
      | "organization"
      | "firstName"
      | "lastName"
      | "email"
    >[]
  >([]);

  const getUser = useQueryBundle(GetUserById, {
    variables: { id: params.userId },
  });
  const user =
    getUser.state === "LOADING" ? undefined : getUser?.data?.user?.byId;

  // On User Update, the backend doesn't return the OrgUsers
  // associated with the User, so let's just cache them here
  // when we get a populated list and not when the list in empty
  useEffect(() => {
    if (user?.allOrgUsers && user?.allOrgUsers?.length > 0) {
      setOrgUsers(
        (user?.allOrgUsers ?? []) as Pick<
          OrgUser,
          | "id"
          | "isAdmin"
          | "isEmployee"
          | "isReplacementEmployee"
          | "active"
          | "organization"
          | "firstName"
          | "lastName"
          | "email"
        >[]
      );
    }
  }, [user]);

  const [changeEmailIsOpen, setChangeEmailIsOpen] = useState(false);
  const onCloseEmailDialog = React.useCallback(
    () => setChangeEmailIsOpen(false),
    [setChangeEmailIsOpen]
  );
  const [updateLoginEmail] = useMutationBundle(UpdateLoginEmail, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onUpdateLoginEmail = async (loginEmail: string) => {
    await updateLoginEmail({
      variables: {
        loginEmailChange: {
          id: params.userId,
          rowVersion: user?.rowVersion ?? "",
          loginEmail: loginEmail,
        },
      },
    });
  };

  const [updateUser] = useMutationBundle(UpdateUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const update = React.useCallback(
    (
      firstName: string,
      middleName: string | undefined,
      lastName: string,
      phone: string | undefined,
      phoneIsValidForSms: boolean | undefined
    ) => {
      return updateUser({
        variables: {
          user: {
            id: params.userId,
            rowVersion: user?.rowVersion ?? "",
            firstName,
            middleName,
            lastName,
            phone,
            phoneIsValidForSms,
          },
        },
      });
    },
    [updateUser, params, user]
  );

  const [resetPassword] = useMutationBundle(ResetUserPassword, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const onResetPassword = async () => {
    const response = await resetPassword({
      variables: {
        userInfo: {
          id: params.userId,
        },
      },
    });
    const result = response?.data?.user?.resetPassword;
    if (result) {
      openSnackbar({
        message: t("Reset password email has been sent"),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
    }
  };

  const [inviteUser] = useMutationBundle(InviteUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const triggerImpersonation = async () => {
    // Set userId in sessionStorage
    sessionStorage.setItem(Config.impersonation.actingUserIdKey, params.userId);
    // To prevent issues with cached data from the current user
    // we can use window.location.href to redirect, which is the
    // same as a hard refresh, and empties the cache
    window.location.href = "/";
  };

  const smsStopped = useMemo(() => {
    if (!user || !user.stopSmsUntilUtc) {
      return false;
    }

    const stopDateTime = parseISO(user.stopSmsUntilUtc);
    return !isPast(stopDateTime);
  }, [user]);

  const smsPaused = useMemo(() => {
    if (!user || !user.suspendSmsUntilUtc) {
      return false;
    }

    const suspendDateTime = parseISO(user.suspendSmsUntilUtc);
    return !isPast(suspendDateTime);
  }, [user]);

  if (getUser.state === "LOADING") {
    return <></>;
  }

  const userName = `${user?.firstName} ${user?.lastName}`;
  const resetPasswordTicketUrl = user?.resetPasswordTicketUrl ?? "";

  let pendingInvite = false;
  let currentStatusLabel = "";
  if (user?.isAccountSetup) {
    currentStatusLabel = t("User has setup their account");
  } else if (user?.inviteSent) {
    currentStatusLabel = t("Invitation from {{date}} pending", {
      date: format(new Date(user.inviteSentAtUtc), "MMM d h:mm aaaa"),
    });
    pendingInvite = true;
  } else {
    currentStatusLabel = t("No invite sent");
  }

  const orgUserColumns: Column<
    Pick<
      OrgUser,
      | "id"
      | "isAdmin"
      | "isEmployee"
      | "isReplacementEmployee"
      | "active"
      | "organization"
      | "firstName"
      | "lastName"
      | "email"
    >
  >[] = [
    { title: t("OrgUserId"), field: "id" },
    { title: t("Org Id"), field: "organization.id" },
    { title: t("Org Name"), field: "organization.name" },
    {
      title: t("Name In Org"),
      render: rowData => `${rowData.firstName} ${rowData.lastName}`,
    },
    {
      title: t("Email In Org"),
      field: "email",
    },
    {
      title: t("Roles"),
      render: rowData => {
        const roles: string[] = [];
        if (rowData.isAdmin) {
          roles.push("Admin");
        }
        if (rowData.isEmployee) {
          roles.push("Employee");
        }
        if (rowData.isReplacementEmployee) {
          roles.push("Sub");
        }
        return roles.join(", ");
      },
    },
    {
      title: t("Active"),
      render: rowData => (rowData.active ? t("Yes") : t("No")),
    },
  ];

  return (
    <>
      <ChangeLoginEmailDialog
        open={changeEmailIsOpen}
        onClose={onCloseEmailDialog}
        onUpdateLoginEmail={onUpdateLoginEmail}
        triggerReauth={false}
      />

      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <PageTitle title={userName} />
        </Grid>
        <Grid item className={classes.actionContainer}>
          <div className={classes.action}>
            <Button
              variant="outlined"
              onClick={() =>
                history.push(
                  UserNotificationLogRoute.generate({
                    userId: params.userId,
                  })
                )
              }
            >
              {t("View notification log")}
            </Button>
          </div>
          <div className={classes.action}>
            <Button
              variant="outlined"
              onClick={() =>
                history.push(
                  UserSmsLogRoute.generate({
                    userId: params.userId,
                  })
                )
              }
            >
              {t("View sms log")}
            </Button>
          </div>
          <div className={classes.action}>
            <Button
              variant="outlined"
              onClick={async () => {
                await inviteUser({ variables: { userId: params.userId } });
                await getUser.refetch();
              }}
            >
              {user?.inviteSent || user?.isAccountSetup
                ? t("Resend Invite")
                : t("Send Invite")}
            </Button>
          </div>
          <div className={classes.action}>
            <Button
              variant="outlined"
              onClick={async () => await onResetPassword()}
            >
              {t("Reset Password")}
            </Button>
          </div>
        </Grid>
      </Grid>
      <Grid
        container
        justify="flex-end"
        alignItems="flex-start"
        direction="row"
      >
        <Grid item className={classes.actionContainer}>
          <div className={(classes.action, classes.rowPadding)}>
            <Button
              variant="outlined"
              disabled={
                orgUsers.find(ou => ou.active) === undefined ||
                user?.isSystemAdministrator
              }
              onClick={async () => await triggerImpersonation()}
            >
              {t("Impersonate")}
            </Button>
          </div>
        </Grid>
      </Grid>
      <Section>
        <Formik
          initialValues={{
            firstName: user?.firstName ?? "",
            middleName: user?.middleName ?? undefined,
            lastName: user?.lastName ?? "",
            phone: user?.phone ?? undefined,
            phoneIsValidForSms: user?.phoneIsValidForSms,
          }}
          onSubmit={async (data, meta) => {
            await update(
              data.firstName,
              data.middleName,
              data.lastName,
              data.phone,
              data.phoneIsValidForSms ? data.phoneIsValidForSms : undefined
            );
          }}
          validationSchema={yup.object().shape({
            firstName: yup
              .string()
              .nullable()
              .required(t("First Name is required")),
            lastName: yup
              .string()
              .nullable()
              .required(t("Last Name is required")),
            phone: yup
              .string()
              .nullable()
              .matches(phoneRegExp, t("Phone Number Is Not Valid")),
          })}
        >
          {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
            <form onSubmit={handleSubmit}>
              <Grid
                container
                justify="flex-start"
                alignItems="flex-end"
                spacing={2}
              >
                <Grid item xs={9}>
                  <Input
                    label={t("Username/Email")}
                    value={user?.loginEmail ?? ""}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="outlined"
                    onClick={() => setChangeEmailIsOpen(true)}
                  >
                    {t("Change Username")}
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label={t("First name")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "firstName",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label={t("Middle name")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "middleName",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label={t("Last name")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "lastName",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Input
                    label={t("Phone")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "phone",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      fullWidth: true,
                    }}
                  />
                </Grid>
                {user?.phone && (
                  <Grid item xs={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={
                            values.phoneIsValidForSms ||
                            values.phoneIsValidForSms == undefined ||
                            values.phoneIsValidForSms == null
                          }
                          onChange={() =>
                            setFieldValue("phoneIsValidForSms", true)
                          }
                        />
                      }
                      label={t("Phone is valid for sms")}
                    />
                    {smsStopped && (
                      <div>
                        {t("SMS stopped until {{date}}", {
                          date: format(
                            new Date(user.stopSmsUntilUtc),
                            "MMM d yyyy h:mm aaaa"
                          ),
                        })}
                      </div>
                    )}
                    {smsPaused && (
                      <div>
                        {t("SMS paused until {{date}}", {
                          date: format(
                            new Date(user.suspendSmsUntilUtc),
                            "MMM d yyyy h:mm aaaa"
                          ),
                        })}
                      </div>
                    )}
                  </Grid>
                )}
              </Grid>
              <ActionButtons
                submit={{ text: t("Save"), execute: submitForm }}
                cancel={{
                  text: t("Cancel"),
                  execute: () => {
                    history.push(UsersRoute.generate(params));
                  },
                }}
              />
            </form>
          )}
        </Formik>

        <Divider className={classes.divider} />

        <div>
          <Typography variant="h5" className={classes.header}>
            {t("Access status")}
          </Typography>
          <Typography variant="h6">{currentStatusLabel}</Typography>
          {user?.inviteSent && !pendingInvite && (
            <Typography variant="h6">
              {t("Last invite sent on {{date}}", {
                date: format(new Date(user.inviteSentAtUtc), "MMM d h:mm aaaa"),
              })}
            </Typography>
          )}
          {user?.temporaryPassword && (
            <div>
              <span className={classes.fieldLabel}>
                {t("Temporary Password")}:
              </span>{" "}
              {user?.temporaryPassword}
            </div>
          )}
          {resetPasswordTicketUrl.length > 0 && (
            <>
              <div>
                <span className={classes.fieldLabel}>
                  {t("Reset password url")}:
                </span>{" "}
                {resetPasswordTicketUrl}
              </div>
              {!!user?.resetPasswordTicketUrlGeneratedAtUtc && (
                <div>
                  <span className={classes.fieldLabel}>
                    {t("Reset password url generated at")}:
                  </span>{" "}
                  {format(
                    new Date(user.resetPasswordTicketUrlGeneratedAtUtc),
                    "MMM d h:mm aaaa"
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <Divider className={classes.divider} />

        <div>
          <Table
            title={t("Organization access")}
            columns={orgUserColumns}
            data={orgUsers}
          />
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  actionContainer: {
    display: "flex",
  },
  action: {
    marginLeft: theme.spacing(2),
  },
  rowPadding: {
    paddingBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  fieldLabel: {
    fontWeight: "bold",
  },
}));
