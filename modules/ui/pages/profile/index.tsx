import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { UpdateLoginEmail } from "./graphql/UpdateLoginEmail.gen";
import { UpdateUser } from "./graphql/UpdateUser.gen";
import { ResetPassword } from "./graphql/ResetPassword.gen";
import { ProfileBasicInfo } from "./components/basic-info";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { UserUpdateInput } from "graphql/server-types.gen";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useTranslation } from "react-i18next";
import { GetUserById } from "ui/pages/users/graphql/get-user-by-id.gen";
import { VerifyPhoneNumber } from "ui/pages/profile/graphql/verify-phone-number.gen";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useHistory } from "react-router";
type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const history = useHistory();

  const myUserAccess = useMyUserAccess();
  const user = myUserAccess?.me?.user;
  const actualUser = myUserAccess?.me?.actualUser;

  const getMyUser = useQueryBundle(GetUserById, {
    variables: {
      id: user?.id,
    },
    skip: !user?.id,
  });
  const myUser =
    getMyUser.state === "LOADING" ? undefined : getMyUser?.data?.user?.byId;

  const [updateLoginEmail] = useMutationBundle(UpdateLoginEmail, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [resetPassword] = useMutationBundle(ResetPassword, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [verifyPhoneNumber] = useMutationBundle(VerifyPhoneNumber, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateUser] = useMutationBundle(UpdateUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onUpdateUser = async (updatedUser: UserUpdateInput) => {
    await updateUser({
      variables: {
        user: {
          ...updatedUser,
        },
      },
    });
  };

  const onUpdateLoginEmail = async (loginEmail: string) => {
    await updateLoginEmail({
      variables: {
        loginEmailChange: {
          id: myUser?.id ?? "",
          rowVersion: myUser?.rowVersion ?? "",
          loginEmail: loginEmail,
        },
      },
    });
  };

  const onResetPassword = async () => {
    const response = await resetPassword({
      variables: { resetPasswordInput: { id: myUser?.id ?? "" } },
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

  const onVerifyPhoneNumber = async () => {
    const phoneNumber = myUser?.phone;

    const response = await verifyPhoneNumber({
      variables: { phoneNumber: phoneNumber ?? "" },
    });

    openSnackbar({
      message: t(
        "We have sent a message to " +
          phoneNumber +
          " to confirm that everything is working. If you do not receive that message in the next few minutes, please confirm that your number is a valid mobile number that can receive text message."
      ),
      dismissable: true,
      status: "info",
      autoHideDuration: 10000,
    });
  };

  const isImpersonating = useIsImpersonating();

  if (isImpersonating && !actualUser?.isSystemAdministrator) {
    history.push("/");
  }

  if (!myUser) {
    return <></>;
  }

  return (
    <ProfileBasicInfo
      user={myUser}
      onUpdateLoginEmail={onUpdateLoginEmail}
      onVerifyPhoneNumber={onVerifyPhoneNumber}
      onUpdateUser={onUpdateUser}
      onResetPassword={onResetPassword}
    />
  );
};
