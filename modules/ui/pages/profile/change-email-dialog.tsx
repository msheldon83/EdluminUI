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

type Props = {
  open: boolean;
  onClose: () => void;
  loginEmail: MyProfile.User["loginEmail"];
  updateLoginEmail: MutationFunction<
    UpdateLoginEmail.Mutation,
    UpdateLoginEmail.Variables
  >;
};

export const ChangeLoginEmailDialog: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Formik
        initialValues={{ loginEmail: "" }}
        onSubmit={(values: any) =>
          props.updateLoginEmail({ variables: values })
        }
        validationSchema={Yup.object().shape({
          loginEmail: Yup.string()
            .email()
            .required("Required"),
        })}
      >
        {({ values, handleSubmit, isSubmitting }) => (
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
              <TextButton
                type="submit"
                onClick={() => {
                  console.log("submit new value", values);
                }}
                disabled={isSubmitting}
              >
                <Trans i18nKey="core.save">Save</Trans>
              </TextButton>
            </DialogActions>
          </div>
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
