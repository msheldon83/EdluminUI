import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { UpdateLoginEmail } from "ui/pages/profile/UpdateLoginEmail.gen";
import { UpdateUser } from "./UpdateUser.gen";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import * as React from "react";
import { ProfileUI } from "./profile-ui";
import { useTimezones } from "reference-data/timezones";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const myProfile = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });
  const timeZones = useTimezones();
  const { openSnackbar } = useSnackbar();
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
  const [updateUser] = useMutationBundle(UpdateUser, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  if (myProfile.state === "LOADING") {
    return <></>;
  }
  if (
    !myProfile.data ||
    !myProfile.data.userAccess ||
    !myProfile.data.userAccess.me ||
    !myProfile.data.userAccess.me.user ||
    !timeZones
  ) {
    return <div>oh no</div>;
  }
  return (
    <ProfileUI
      user={myProfile.data.userAccess.me.user}
      updateLoginEmail={updateLoginEmail}
      updateUser={updateUser}
      timeZoneOptions={timeZones}
      resetPassword={resetPassword}
    />
  );
};
