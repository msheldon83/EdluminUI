import * as React from "react";
import { useCallback } from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { UpdateLoginEmail } from "./graphql/UpdateLoginEmail.gen";
import { UpdateUser } from "./graphql/UpdateUser.gen";
import { ResetPassword } from "./graphql/ResetPassword.gen";
import { ProfileBasicInfo } from "./components/basic-info";
import { Formik } from "formik";
import { NotificationPreferences } from "./components/notification-preferences";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { UserUpdateInput, TimeZone } from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useTranslation } from "react-i18next";
import { GetUserById } from "./graphql/get-user-by-id.gen";
import { VerifyPhoneNumber } from "ui/pages/profile/graphql/verify-phone-number.gen";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useHistory } from "react-router";
import { phoneRegExp } from "helpers/regexp";
import * as yup from "yup";
import { RegisteredDevices } from "./components/registered-devices";
import { useIsSubstitute } from "reference-data/is-substitute";

export const ProfilePage: React.FC<{}> = props => {
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

  const onUpdateUser = useCallback(
    async (updatedUser: UserUpdateInput) => {
      await updateUser({
        variables: {
          user: {
            ...updatedUser,
          },
        },
      });
    },
    [updateUser]
  );

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
        message: t("Reset password email has been sent."),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
    }
  };

  const onVerifyPhoneNumber = async () => {
    const response = await verifyPhoneNumber({
      variables: {
        phoneNumber: myUser?.phone ?? "",
      },
    });
    const phoneNumber = response.data?.user?.verifyPhoneNumber?.phone;

    openSnackbar({
      message: t(`We’ve sent a text message to ${phoneNumber}. 
      If you do not receive the text please confirm your number 
      is a valid number to receive text messages.`),
      dismissable: true,
      status: "info",
      autoHideDuration: 10000,
    });
  };

  const notificationPreferencesForUser =
    compact(myUser?.preferences?.notificationPreferences) ?? [];

  const isImpersonating = useIsImpersonating();

  const isSubstitute = useIsSubstitute();

  if (isImpersonating && !actualUser?.isSystemAdministrator) {
    history.push("/");
  }

  if (!myUser) {
    return <></>;
  }

  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

  const mobileDevices = compact(myUser?.mobileDevices) ?? [];
  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          firstName: myUser.firstName,
          lastName: myUser.lastName,
          phone: myUser.phone ?? "",
          timeZoneId: myUser.timeZoneId?.toString() ?? "",
          notificationPreferences: notificationPreferencesForUser,
        }}
        onSubmit={async data =>
          await onUpdateUser({
            id: myUser.id,
            rowVersion: myUser.rowVersion,
            firstName: data.firstName,
            lastName: data.lastName,
            phone:
              data.phone.trim().length === 0
                ? null
                : cleanPhoneNumber(data.phone),
            timeZoneId: data.timeZoneId as TimeZone,
            preferences: {
              notificationPreferences: data.notificationPreferences
                ? data.notificationPreferences.map(x => ({
                    notificationReasonId: x.notificationReasonId,
                    receiveEmailNotifications: x.receiveEmailNotifications,
                    receiveInAppNotifications: x.receiveInAppNotifications,
                    receiveSmsNotifications: x.receiveSmsNotifications,
                  }))
                : undefined,
            },
          })
        }
        validationSchema={yup.object().shape({
          firstName: yup.string().required(t("First name is required.")),
          lastName: yup.string().required(t("Last name is required.")),
          timeZoneId: yup.string().required(t("Time zone is required.")),
          phone: yup
            .string()
            .when("isSub", {
              is: isSub => {
                return isSubstitute;
              },
              then: yup.string().required("Phone number is required."),
            })
            .nullable()
            .matches(phoneRegExp, t("Phone number is not valid.")),
        })}
      >
        {({ handleSubmit, submitForm, values, setFieldValue, dirty }) => (
          <form onSubmit={handleSubmit}>
            <ProfileBasicInfo
              user={myUser}
              formValues={values}
              onUpdateLoginEmail={onUpdateLoginEmail}
              onVerifyPhoneNumber={onVerifyPhoneNumber}
              setFieldValue={setFieldValue}
              onResetPassword={onResetPassword}
              submitForm={submitForm}
              formDirty={dirty}
            />
            {!myUser?.isSystemAdministrator && (
              <NotificationPreferences
                notificationPreferences={values.notificationPreferences}
                setFieldValue={setFieldValue}
                submitForm={submitForm}
                formDirty={dirty}
              />
            )}
            {mobileDevices.length > 0 && (
              <RegisteredDevices mobileDevices={mobileDevices} />
            )}
          </form>
        )}
      </Formik>
    </>
  );
};
