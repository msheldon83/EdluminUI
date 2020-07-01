import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { useAuth0 } from "auth/auth0";
import { Formik } from "formik";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { InformationHelperText } from "ui/components/information-helper-text";
import { TextButton } from "ui/components/text-button";
import * as Yup from "yup";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpdateLoginEmail: (loginEmail: string) => Promise<any>;
  triggerReauth: boolean;
};

export const ChangeLoginEmailDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const auth0 = useAuth0();
  const isImpersonating = useIsImpersonating();

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Formik
        initialValues={{ loginEmail: "" }}
        onSubmit={async data => {
          await props.onUpdateLoginEmail(data.loginEmail);
          if (!isImpersonating && props.triggerReauth) {
            auth0.login();
          }
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
                <Input
                  value={values.loginEmail}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "loginEmail",
                    id: "loginEmail",
                  }}
                  fullWidth
                  placeholder={t("New Email Address")}
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
