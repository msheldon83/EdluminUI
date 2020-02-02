import {
  makeStyles,
  Grid,
  Button,
  Typography,
  Divider,
} from "@material-ui/core";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useIsMobile, useDeferredState } from "hooks";
import * as React from "react";
import { useMemo } from "react";
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
import { ChangeLoginEmailDialog } from "../profile/change-email-dialog";
import { UpdateLoginEmail } from "../profile/UpdateLoginEmail.gen";
import { format } from "date-fns";
import { Table } from "ui/components/table";
import { OrgUser } from "graphql/server-types.gen";
import { Column } from "material-table";

type Props = {};

export const UserViewPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(UserViewRoute);

  const [changeEmailIsOpen, setChangeEmailIsOpen] = React.useState(false);
  const onCloseEmailDialog = React.useCallback(
    () => setChangeEmailIsOpen(false),
    [setChangeEmailIsOpen]
  );
  const [updateLoginEmail] = useMutationBundle(UpdateLoginEmail, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

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
      rowVersion: string | undefined
    ) => {
      return updateUser({
        variables: {
          user: {
            id: params.userId,
            rowVersion: rowVersion ?? "",
            firstName,
            middleName,
            lastName,
          },
        },
      });
    },
    [updateUser, params]
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

  const getUser = useQueryBundle(GetUserById, {
    variables: { id: params.userId },
  });

  if (getUser.state === "LOADING") {
    return <></>;
  }

  const user = getUser?.data?.user?.byId;
  const userName = `${user?.firstName} ${user?.lastName}`;
  const rowVersion = user?.rowVersion;
  const orgUsers = (user?.orgUsers ?? []) as Pick<
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
  >[];
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
        updateLoginEmail={updateLoginEmail}
        user={user!}
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

      <Section>
        <Formik
          initialValues={{
            firstName: user?.firstName ?? "",
            middleName: user?.middleName ?? undefined,
            lastName: user?.lastName ?? "",
          }}
          onSubmit={async (data, meta) => {
            await update(
              data.firstName,
              data.middleName,
              data.lastName,
              rowVersion
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
          })}
        >
          {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
            <form onSubmit={handleSubmit}>
              <Grid
                container
                justify="space-between"
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
