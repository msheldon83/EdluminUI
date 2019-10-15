import { MutationFunction } from "@apollo/react-common";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { UpdateLoginEmail } from "graphql/mutations/UpdateLoginEmail.gen";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import * as React from "react";
import { Trans } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { InformationHelperText } from "ui/components/information-helper-text";
import { Formik } from "formik";
import * as Forms from "atomic-object/forms";
import * as Yup from "yup";
import { UserLoginEmailChangeInput } from "graphql/server-types.gen";
import { useAuth0 } from "auth/auth0";

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
            .email("Must be a valid email")
            .required("Required"),
        })}
      >
        {({ values, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className={classes.spacing}>
              <DialogTitle>
                <Trans i18nKey="profile.changeEmail">Change Email</Trans>
              </DialogTitle>
              <DialogContent>
                <Forms.TextField
                  name={"loginEmail"}
                  margin="normal"
                  variant="outlined"
                  placeholder={"New Email Address"}
                  fullWidth
                />

                <InformationHelperText
                  text={
                    <Trans i18nKey="profile.newEmailIsUserId">
                      Your new email will be used as your User Id.
                    </Trans>
                  }
                  className={classes.helperText}
                />
              </DialogContent>
              <DialogActions>
                <TextButton onClick={props.onClose}>
                  <Trans i18nKey="core.cancel">Cancel</Trans>
                </TextButton>
                <TextButton type="submit" disabled={isSubmitting}>
                  <Trans i18nKey="core.save">Save</Trans>
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
