import * as React from "react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import {
  makeStyles,
  Grid,
  Checkbox,
  Radio,
  FormControlLabel,
  FormHelperText,
  RadioGroup,
} from "@material-ui/core";
import * as yup from "yup";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { NeedsReplacement } from "graphql/server-types.gen";
import { ActionButtons } from "./action-buttons";

type Props = {
  positionType: {
    forPermanentPositions: boolean;
    needsReplacement: NeedsReplacement;
    forStaffAugmentation: boolean;
    minAbsenceDurationMinutes: number;
  };
  submitText: string;
  onSubmit: Function;
  onCancel: Function;
};

export const Settings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  return (
    <Section>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={{
          forPermanentPositions: props.positionType.forPermanentPositions,
          needsReplacement: props.positionType.needsReplacement,
          forStaffAugmentation: props.positionType.forStaffAugmentation,
          minAbsenceDurationMinutes:
            props.positionType.minAbsenceDurationMinutes,
        }}
        onSubmit={(data, meta) => {
          props.onSubmit(
            data.forPermanentPositions,
            data.needsReplacement,
            data.forStaffAugmentation,
            data.minAbsenceDurationMinutes
          );
        }}
        validationSchema={yup.object().shape({
          minAbsenceDurationMinutes: yup
            .number()
            .required(t("Minimum Absence Duration is required")),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <h4>{t("How will you use this position?")}</h4>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.forPermanentPositions}
                      onChange={e => {
                        setFieldValue(
                          "forPermanentPositions",
                          e.target.checked
                        );
                      }}
                      value={values.forPermanentPositions}
                      color="primary"
                    />
                  }
                  label={t("Use for Employees")}
                />
                <FormHelperText>
                  {t("Will you assign employees to this position?")}
                </FormHelperText>
                <div>{t("Need Substitute")}</div>
                <RadioGroup
                  aria-label="position"
                  name="position"
                  value={values.needsReplacement}
                  onChange={e => {
                    setFieldValue("needsReplacement", e.target.value);
                  }}
                  row
                >
                  <FormControlLabel
                    value={NeedsReplacement.Yes}
                    control={<Radio color="primary" />}
                    label={t("Yes")}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value={NeedsReplacement.No}
                    control={<Radio color="primary" />}
                    label={t("No")}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value={NeedsReplacement.Sometimes}
                    control={<Radio color="primary" />}
                    label={t("Sometimes")}
                    labelPlacement="end"
                  />
                </RadioGroup>
                <FormHelperText>
                  {t(
                    "Will employees working this position usually need to have a substitute?"
                  )}
                </FormHelperText>
                <FormHelperText>
                  {t(
                    "Don’t worry, you will be able to change this for an individual employee."
                  )}
                </FormHelperText>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.forStaffAugmentation}
                      onChange={e => {
                        setFieldValue("forStaffAugmentation", e.target.checked);
                      }}
                      value={values.forStaffAugmentation}
                      color="primary"
                    />
                  }
                  label={t("Use for Vacancies")}
                />
                <FormHelperText>
                  {t(
                    "Will you need to request a substitute without an employee being absent?"
                  )}
                </FormHelperText>
              </Grid>
              <Grid item xs={12}>
                {/*TODO: Make this work. Is this a type ahead search or a dropdown?*/}
                <div className={classes.label}>{t("Default contract")}</div>
                <FormTextField
                  name="defaultContract"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  helperText={t(
                    "Positions of this type will likely be associated with this contract"
                  )}
                  //fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <h4>{t("How should the system behave for this position")}</h4>
                <FormHelperText>
                  {t(
                    "Don’t worry, you will be able to change these settings for an individual employee"
                  )}
                </FormHelperText>
                <div className={classes.label}>
                  {t("Minimum absence duration")}
                </div>
                <FormTextField
                  name="minAbsenceDurationMinutes"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  helperText={t(
                    "The shortest time that an employee with this position can be absent."
                  )}
                  //fullWidth
                />
              </Grid>
            </Grid>
            <ActionButtons
              submit={{ text: props.submitText, execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
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
