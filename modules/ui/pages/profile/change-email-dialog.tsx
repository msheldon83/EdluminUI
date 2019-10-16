import { MutationFunction } from "@apollo/react-common";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import * as Forms from "atomic-object/forms";
import { useAuth0 } from "auth/auth0";
import { Formik } from "formik";
import { UpdateLoginEmail } from "graphql/mutations/UpdateLoginEmail.gen";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import { UserLoginEmailChangeInput } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InformationHelperText } from "ui/components/information-helper-text";
import { TextButton } from "ui/components/text-button";
import * as Yup from "yup";

type Props = {
  open: boolean;
  onClose: () => void;
  user: MyProfile.User;
  updateLoginEmail: MutationFunction<
    UpdateLoginEmail.Mutation,
    UpdateLoginEmail.Variables
  >;
};

export const ChangeLoginEmailDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const initialValues: UserLoginEmailChangeInput = {
    loginEmail: "",
    userId: props.user.id!, // we should get rid of the ! when id is not nullable
    rowVersion: props.user.rowVersion,
  };
  const auth0 = useAuth0();
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values: UserLoginEmailChangeInput) => {
          await props.updateLoginEmail({
            variables: { loginEmailChange: { ...values } },
          });
          auth0.login();
          props.onClose();
        }}
        validationSchema={Yup.object().shape({
          loginEmail: Yup.string()
            .email(t("profile.changeEmailInvalid", "Must be a valid email"))
            .required(t("profile.changeEmailRequired", "Required")),
        })}
      >
        {({ values, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className={classes.spacing}>
              <DialogTitle>{t("Change Email")}</DialogTitle>
              <DialogContent>
                <Forms.TextField
                  name={"loginEmail"}
                  margin="normal"
                  variant="outlined"
                  placeholder={t(
                    "profile.newEmailAddress",
                    "New Email Address"
                  )}
                  fullWidth
                />

                <InformationHelperText
                  text={t("Your new email will be used as your User Id.")}
                  className={classes.helperText}
                />
              </DialogContent>
              <DialogActions>
                <TextButton onClick={props.onClose}>{t("Cancel")}</TextButton>
                <TextButton type="submit" disabled={isSubmitting}>
                  {t("Save")}
                </TextButton>
              </DialogActions>
            </div>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  helperText: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  spacing: {
    padding: theme.spacing(1),
    paddingBottom: 0,
  },
}));
