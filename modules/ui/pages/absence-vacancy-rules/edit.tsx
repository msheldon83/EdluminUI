import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import {
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  FormHelperText,
  Checkbox,
} from "@material-ui/core";
import { useIsMobile } from "hooks";
import { Formik } from "formik";
import { Input } from "ui/components/form/input";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import Button from "@material-ui/core/Button";
import { OptionTypeBase } from "react-select/src/types";
import * as Yup from "yup";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { ActionButtons } from "ui/components/action-buttons";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { OrganizationUpdateInput, FeatureFlag } from "graphql/server-types.gen";

type Props = {
  organization: OrganizationUpdateInput;
  onSubmit: (organizationUpdateInput: OrganizationUpdateInput) => Promise<any>;
  onCancel: () => void;
};

export const EditAbsenceVacancyRules: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();

  const initialValues = {
    featureFlags: props?.organization?.config?.featureFlags || [
      FeatureFlag.Verify,
      FeatureFlag.FullDayAbsences,
      FeatureFlag.HalfDayAbsences,
      FeatureFlag.HourlyAbsences,
    ],
    minLeadTimeMinutesToCancelVacancy:
      props.organization?.config?.minLeadTimeMinutesToCancelVacancy || 240,
    minutesBeforeStartAbsenceCanBeCreated:
      props.organization?.config?.minutesBeforeStartAbsenceCanBeCreated || 0,
    requestedSubCutoffMinutes:
      props.organization?.config?.requestedSubCutoffMinutes || 720,
    minRequestedEmployeeHoldMinutes:
      props.organization?.config?.minRequestedEmployeeHoldMinutes || 10,
    maxRequestedEmployeeHoldMinutes:
      props.organization?.config?.maxRequestedEmployeeHoldMinutes || 1440,
    minorConflictThresholdMinutes:
      props.organization?.config?.minorConflictThresholdMinutes || 15,
    minutesRelativeToStartVacancyCanBeFilled:
      props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled ||
      60,
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        minLeadTimeMinutesToCancelVacancy: Yup.number().nullable(),
        minutesBeforeStartAbsenceCanBeCreated: Yup.number().nullable(),
        requestedSubCutoffMinutes: Yup.number().nullable(),
        minRequestedEmployeeHoldMinutes: Yup.number().nullable(),
        maxRequestedEmployeeHoldMinutes: Yup.number().nullable(),
        minorConflictThresholdMinutes: Yup.number().nullable(),
        minutesRelativeToStartVacancyCanBeFilled: Yup.number().nullable(),
        featureFlags: Yup.array(Yup.string()).required(t("* Required *")),
      }),
    [t]
  );

  return (
    <>
      <PageTitle title={t("Absence & Vacancy Rules")} />
      <Section>
        <Formik
          initialValues={initialValues}
          validationSchema={validateBasicDetails}
          onSubmit={async (data: any) => {
            await props.onSubmit({
              rowVersion: props.organization.rowVersion,
              config: {
                featureFlags: data.featureFlags,
                minLeadTimeMinutesToCancelVacancy:
                  data.minLeadTimeMinutesToCancelVacancy,
                minutesBeforeStartAbsenceCanBeCreated:
                  data.minutesBeforeStartAbsenceCanBeCreated,
                requestedSubCutoffMinutes: data.requestedSubCutoffMinutes,
                minRequestedEmployeeHoldMinutes:
                  data.minRequestedEmployeeHoldMinutes,
                maxRequestedEmployeeHoldMinutes:
                  data.maxRequestedEmployeeHoldMinutes,
                minorConflictThresholdMinutes:
                  data.minorConflictThresholdMinutes,
                minutesRelativeToStartVacancyCanBeFilled:
                  data.minutesRelativeToStartVacancyCanBeFilled,
              },
            });
          }}
        >
          {({
            handleSubmit,
            handleChange,
            submitForm,
            setFieldValue,
            values,
          }) => (
            <form onSubmit={handleSubmit}>
              {/* <Grid item xs={12} sm={3}>
              <SelectNew
                label={t("Feature Flags")}
                name={"featureFlags"}
                value={props.featureFlagOptions.filter(
                  e => e.value && values.featureFlags?.some(v => v === e.value)
                )}
                withResetValue={false}
                options={props.featureFlagOptions}
                onChange={e => {
                  const ids = e.map((v: OptionType) => v.value.toString());
                  setFieldValue("featureFlags", ids);
                }}
                doSort={false}
                multiple={true}
              />
            </Grid>
            <Grid item xs={12} sm={3} >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.isEdustaffOrg}
                    onChange={e => {
                      setFieldValue("isEdustaffOrg", e.target.checked);
                    }}
                    value={values.isEdustaffOrg}
                    color="primary"
                  />
                }
                label={t("Is this an Edustaff Org?")}
              />
            </Grid> */}
              <div className={classes.rowMargin}>
                <Typography variant="h6">
                  {t("Absence minimum notice")}
                </Typography>
                <FormHelperText>
                  {t("Employees may not enter an absence that starts within")}
                </FormHelperText>
                <Grid item xs={2}>
                  <Input
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "minutesBeforeStartAbsenceCanBeCreated",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      fullWidth: true,
                    }}
                  />
                </Grid>
              </div>
              <Grid item xs={2} className={classes.rowMargin}>
                <Input
                  label={t("Requested Sub Cutoff Minutes")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "requestedSubCutoffMinutes",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Input
                  label={t("Minimum Lead Time Minutes to Cancel Vacancy")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minLeadTimeMinutesToCancelVacancy",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Input
                  label={t("Minimum Requested Employee Hold Minutes")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minRequestedEmployeeHoldMinutes",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Input
                  label={t("Max Requested Employee Hold Minutes")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "maxRequestedEmployeeHoldMinutes",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Input
                  label={t("Minor Conflict Threshold Minutes")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minorConflictThresholdMinutes",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Input
                  label={t("Minutes Relative To Start Vacancy Can Be Filled")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minutesRelativeToStartVacancyCanBeFilled",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <ActionButtons
                submit={{ text: t("Save"), execute: submitForm }}
                cancel={{ text: t("Cancel"), execute: props.onCancel }}
              />
            </form>
          )}
        </Formik>
      </Section>
    </>
  );
};
const useStyles = makeStyles(theme => ({
  rowMargin: {
    marginTop: theme.spacing(4),
  },
}));
