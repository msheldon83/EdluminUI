import { useIsMobile } from "hooks";
import * as React from "react";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Grid, Typography } from "@material-ui/core";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";

type Props = {
  description?: string | null | undefined;
  onSubmit: (description?: string | null | undefined) => void;
  onCancel: () => void;
};

export const PayCodeDescription: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const initialValues = {
    description: props.description,
  };

  const validateBasicDetails = React.useMemo(
    () =>
      yup.object().shape({
        description: yup.string().nullable(),
      }),
    [t]
  );

  return (
    <>
      <Grid item xs={12} sm={12} lg={12}>
        <Typography variant="h6">{t("Description")}</Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validateBasicDetails}
          onSubmit={async (data: any) => {
            props.onSubmit(data.description);
          }}
        >
          {({ handleSubmit, submitForm, values }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={isMobile ? 2 : 8}>
                <Grid item xs={12} sm={6} lg={6}>
                  <Input
                    value={values.description}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      placeholder: `E.g ${"Description"}`,
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
      </Grid>
    </>
  );
};
