import { Grid } from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";

type Props = {
  name: string;
  externalId?: string;
  namePlaceholder: string;
  onSubmit: (name: string, externalId?: string) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  isCategory?: boolean;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const initialValues = {
    name: props.name,
    externalId: props.externalId ?? "",
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string()
          .nullable()
          .required(t("Identifier is required")),
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
          props.onSubmit(data.name, data.externalId);
        }}
      >
        {({ handleSubmit, handleChange, submitForm }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 8}>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
                  label={
                    props.isCategory
                      ? t("Absence reason category name")
                      : t("Absence reason name")
                  }
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g ${props.namePlaceholder}`,
                    name: "name",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      props.onNameChange(e.currentTarget.value);
                    },
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
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
