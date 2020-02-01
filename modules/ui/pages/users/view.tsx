import { makeStyles, Grid, Button, Typography } from "@material-ui/core";
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
                <Grid item xs={12} className={classes.accessDetails}>
                  <Typography variant="h5">{currentStatusLabel}</Typography>
                  {user?.inviteSent && !pendingInvite && (
                    <Typography variant="h5">
                      {t("Last invite sent on {{date}}", {
                        date: format(
                          new Date(user.inviteSentAtUtc),
                          "MMM d h:mm aaaa"
                        ),
                      })}
                    </Typography>
                  )}
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
  accessDetails: {
    marginTop: theme.spacing(2),
  },
}));
