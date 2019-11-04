import * as React from "react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { Grid, Typography } from "@material-ui/core";
import * as yup from "yup";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { ActionButtons } from "../../../components/action-buttons";

type Props = {
  positionType: {
    name: string;
    externalId?: string | null | undefined;
  };
  namePlaceholder: string;
  onSubmit: (name: string, externalId?: string | null | undefined) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useScreenSize() === "mobile";

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={{
          name: props.positionType.name,
          externalId: props.positionType.externalId || "",
        }}
        onSubmit={(data, meta) => {
          props.onSubmit(data.name, data.externalId);
        }}
        validationSchema={yup.object().shape({
          name: yup
            .string()
            .nullable()
            .required(t("Name is required")),
          externalId: yup.string().nullable(),
        })}
      >
        {({ handleSubmit, handleChange, values, submitForm }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 8}>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Position type name")}</Typography>
                <FormTextField
                  placeholder={`E.g ${props.namePlaceholder}`}
                  name="name"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    props.onNameChange(e.currentTarget.value);
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("External ID")}</Typography>
                <FormTextField
                  name="externalId"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  helperText={t("Usually used for data integrations")}
                  fullWidth
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
