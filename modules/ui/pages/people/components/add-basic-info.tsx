import { Grid } from "@material-ui/core";
import { Formik, FormikProps } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { Input } from "ui/components/form/input";
import { useQueryBundle } from "graphql/hooks";
import { VerifyEmailAndExternalId } from "../graphql/verify-email-and-externalid.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { EmailWarningDialog } from "./email-warning-dialog";

type Props = {
  orgId: string;
  orgUser: FormValues;
  onSubmit: (
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    email: string,
    middleName?: string | null | undefined,
    externalId?: string | null | undefined
  ) => void;
  onCancel: () => void;
  onNameChange: (
    firstName: string | null | undefined,
    lastName: string | null | undefined
  ) => void;
};

type FormValues = {
  firstName?: string | null | undefined;
  middleName?: string | null | undefined;
  lastName?: string | null | undefined;
  externalId?: string | null | undefined;
  email?: string | null | undefined;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const classes = useStyles();

  // See the larger comment: since we are triggering the validation query from the form submit function
  // we need to then call the submit again after successfully verifying the externalId and email.
  // This gets the form submit so we can call it from outside formik.
  const formRef = useRef<FormikProps<FormValues>>(null);
  const doSubmit = () => {
    formRef.current?.handleSubmit();
  };

  // ---------------------------------------------------------------------
  // There is some goofy looking code in here.  Essentially what we are doing
  // is verifying the email address with Mailgun and externalId for uniqueness
  // before moving on with the wizard, so the creator has the ability to correct
  // any issues.  However since there is not a real good way to call a query
  // using Apollo in an imperative manner, we are doing a workaround by setting
  // the skipVerify varible used to skip the query to true when we want to make
  // the query, then setting it to false after we have processed the result.
  //
  // An invalid externalId will show the warning on the input box like any other validation error
  // An invalid email will show a dialog box asking if they want to ignore the error
  // If both are invalid, they will get warning about the externalId and after that is corrected
  // they would get the ignore and contirnue dialog for the email.
  //
  // This is a way to bypass the Mailgun validation which has been found to be
  // flaky at times.
  // -----------------------------------------------------------------------

  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [externalId, setExternalId] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  useEffect(() => {
    if (props.orgUser.email && props.orgUser.email !== emailAddress) {
      setEmailAddress(props.orgUser.email);
    }
    if (props.orgUser.externalId && props.orgUser.externalId !== externalId) {
      setExternalId(props.orgUser.externalId);
    }
  }, [props.orgUser.email, props.orgUser.externalId]);

  const [
    externalIdValidationMessage,
    setExternalIdValidationMessage,
  ] = useState<string | undefined>(undefined);
  const [emailVerified, setEmailVerified] = useState<
    boolean | null | undefined
  >(false);
  const [skipVerify, setSkipVerify] = useState(true);

  const verifyEmailAndExternalId = useQueryBundle(VerifyEmailAndExternalId, {
    variables: { emailAddress, externalId, orgId: props.orgId },
    skip: skipVerify,
  });

  useEffect(() => {
    if (
      verifyEmailAndExternalId.state !== "LOADING" &&
      verifyEmailAndExternalId.state !== "UPDATING" &&
      verifyEmailAndExternalId.data.user &&
      verifyEmailAndExternalId.data.orgUser
    ) {
      setEmailVerified(verifyEmailAndExternalId.data.user.verifyEmailAddress);
      setSkipVerify(true); // Turn off runnning the query again until submit is pressed

      if (verifyEmailAndExternalId.data.orgUser.verifyExternalId) {
        setExternalIdValidationMessage(undefined);

        if (
          !verifyEmailAndExternalId.data.user.verifyEmailAddress &&
          !skipVerify
        ) {
          setShowEmailWarning(true);
        }
      } else {
        setExternalIdValidationMessage(t("Identifier is not unique"));
      }

      if (
        verifyEmailAndExternalId.data.orgUser.verifyExternalId &&
        verifyEmailAndExternalId.data.user.verifyEmailAddress
      ) {
        doSubmit();
      }
    }
  }, [openSnackbar, t, verifyEmailAndExternalId, skipVerify]);

  const initialValues = {
    firstName: props.orgUser.firstName,
    middleName: props.orgUser.middleName || "",
    lastName: props.orgUser.lastName,
    externalId: props.orgUser.externalId || "",
    email: props.orgUser.email || "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        firstName: Yup.string()
          .nullable()
          .required(t("First name is required")),
        lastName: Yup.string()
          .nullable()
          .required(t("Last name is required")),
        middleName: Yup.string().nullable(),
        externalId: Yup.string()
          .nullable()
          .required(t("Identifier is required")),
        email: Yup.string()
          .nullable()
          .required(t("Email is required")),
      })}
      onSubmit={async (data: any) => {
        if (
          !externalIdValidationMessage &&
          (emailVerified || showEmailWarning)
        ) {
          setShowEmailWarning(false);
          props.onSubmit(
            data.firstName,
            data.lastName,
            data.email,
            data.middleName,
            data.externalId
          );
        } else {
          setSkipVerify(false);
        }
      }}
      innerRef={formRef}
    >
      {({ handleSubmit, handleChange, submitForm, values, errors }) => (
        <form onSubmit={handleSubmit}>
          <EmailWarningDialog
            open={showEmailWarning}
            onClose={() => setShowEmailWarning(false)}
            onSubmit={handleSubmit}
          />
          <Section>
            <SectionHeader title={t("Basic info")} />
            <Grid container spacing={2}>
              <Grid item xs={4} sm={2} lg={2}>
                <Input
                  value={values.firstName}
                  label={t("First name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g Mary`,
                    name: "firstName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      props.onNameChange(
                        e.currentTarget.value,
                        values.lastName
                      );
                    },
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={4} sm={2} lg={2}>
                <Input
                  value={values.middleName}
                  label={t("Middle name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "middleName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                    },
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={4} sm={2} lg={2}>
                <Input
                  value={values.lastName}
                  label={t("Last name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g Smith`,
                    name: "lastName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      props.onNameChange(
                        values.firstName,
                        e.currentTarget.value
                      );
                    },
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
                  value={values.externalId}
                  label={t("Identifier")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "externalId",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    helperText: t("Usually used for data integrations"),
                    fullWidth: true,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      setExternalId(e.currentTarget.value);
                      setExternalIdValidationMessage(undefined);
                    },
                  }}
                  inputStatus={
                    externalIdValidationMessage ? "error" : undefined
                  }
                  validationMessage={externalIdValidationMessage}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
                  value={values.email}
                  label={t("Email")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "email",
                    placeholder: `E.g msmith@email.edu`,
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      setEmailAddress(e.currentTarget.value);
                      setEmailVerified(false);
                    },
                  }}
                />
              </Grid>
            </Grid>
            <ActionButtons
              submit={{ text: t("Next"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
          </Section>
        </form>
      )}
    </Formik>
  );
};
const useStyles = makeStyles(theme => ({
  paddingTop: {
    paddingTop: "10px",
  },
}));
