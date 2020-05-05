import { Grid, makeStyles, FormHelperText } from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { Input } from "ui/components/form/input";

type Props = {
  orgUser: {
    firstName?: string | null | undefined;
    middleName?: string | null | undefined;
    lastName?: string | null | undefined;
    externalId?: string | null | undefined;
    email?: string | null | undefined;
  };
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

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const initialValues = {
    firstName: props.orgUser.firstName,
    middleName: props.orgUser.middleName || "",
    lastName: props.orgUser.lastName,
    externalId: props.orgUser.externalId || "",
    email: props.orgUser.email || "",
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
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
      }),
    [t]
  );

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={initialValues}
        validationSchema={validateBasicDetails}
        onSubmit={async (data: any) => {
          props.onSubmit(
            data.firstName,
            data.lastName,
            data.email,
            data.middleName,
            data.externalId
          );
        }}
      >
        {({ handleSubmit, handleChange, submitForm, values }) => (
          <form onSubmit={handleSubmit}>
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
                  }}
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
                  }}
                />
              </Grid>
            </Grid>
            <ActionButtons
              submit={{ text: t("Next"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
          </form>
        )}
      </Formik>
    </Section>
  );
};
