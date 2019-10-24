import * as React from "react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { makeStyles, Grid, Button } from "@material-ui/core";
import * as yup from "yup";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { TextField as FormTextField } from "ui/components/form/text-field";

type Props = {
  positionType: { name: string | null; externalId: string | null };
  onSubmit: Function;
  onCancel: Function;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={{
          name: props.positionType.name,
          externalId: props.positionType.externalId,
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
        {({ handleSubmit, submitForm }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} lg={6}>
                <div className={classes.label}>{t("Position type name")}</div>
                <FormTextField
                  placeholder={t("Position name")}
                  name="name"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <div className={classes.label}>{t("External ID")}</div>
                <FormTextField
                  placeholder={t("External ID")}
                  name="externalId"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  helperText={t("Usually used for data integrations")}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid
              container
              justify="flex-end"
              spacing={2}
              className={classes.actions}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => {
                    props.onCancel();
                  }}
                >
                  {t("Cancel")}
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={submitForm}>
                  {t("Next")}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    fontWeight: 500,
  },
  actions: {
    marginTop: theme.spacing(4),
  },
}));
