import { Grid } from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { LocationGroupCreateInput } from "graphql/server-types.gen";
import * as Yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { Input } from "ui/components/form/input";

type Props = {
  locationGroup: LocationGroupCreateInput;
  namePlaceholder: string;
  onSubmit: (name: string, description?: string | null | undefined) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
};

export const AddLocationGroup: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const initialValues = {
    name: props.locationGroup.name,
    description: props.locationGroup.description || "",
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        description: Yup.string().nullable(),
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
          props.onSubmit(data.name, data.description);
        }}
      >
        {({ handleSubmit, handleChange, submitForm, values }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 8}>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
                  label={t("School name")}
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
                  label={t("Description")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "description",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
            </Grid>
            <ActionButtons
              submit={{ text: t("Save"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
          </form>
        )}
      </Formik>
    </Section>
  );
};
