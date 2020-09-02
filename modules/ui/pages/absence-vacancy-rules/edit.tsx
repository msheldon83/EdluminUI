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
  InputAdornment,
} from "@material-ui/core";
import { useIsMobile } from "hooks";
import { Formik } from "formik";
import { FormikDurationInput } from "ui/components/form/formik-duration-input";
import { Input } from "ui/components/form/input";
import { Section } from "ui/components/section";
import { useMemo } from "react";
import * as Yup from "yup";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { ActionButtons } from "ui/components/action-buttons";
import { Select } from "ui/components/form/select";
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
    maxLeadTimeMinutesToCancelVacancyPart:
      props.organization?.config?.maxLeadTimeMinutesToCancelVacancyPart || 1440,
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
      props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled &&
      props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled < 0
        ? props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled *
          -1
        : props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled,
    assignmentStart:
      props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled &&
      props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled >= 0
        ? "after"
        : "before",
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        minLeadTimeMinutesToCancelVacancy: Yup.number().nullable(),
        maxLeadTimeMinutesToCancelVacancyPart: Yup.number().nullable(),
        minutesBeforeStartAbsenceCanBeCreated: Yup.number().nullable(),
        requestedSubCutoffMinutes: Yup.number().nullable(),
        minRequestedEmployeeHoldMinutes: Yup.number().nullable(),
        maxRequestedEmployeeHoldMinutes: Yup.number().nullable(),
        minorConflictThresholdMinutes: Yup.number().nullable(),
        minutesRelativeToStartVacancyCanBeFilled: Yup.number().nullable(),
      }),
    []
  );

  const assignmentStartOptions = useMemo(() => {
    return [
      {
        value: "after",
        label: t("after assignment start"),
      },
      {
        value: "before",
        label: t("before assignment start"),
      },
    ];
  }, [t]);

  return (
    <>
      <PageTitle title={t("Absence & Vacancy Rules")} />
      <Section>
        <Formik
          initialValues={initialValues}
          validationSchema={validateBasicDetails}
          onSubmit={async (data: any) => {
            await props.onSubmit({
              orgId: props.organization.orgId,
              rowVersion: props.organization.rowVersion,
              config: {
                featureFlags: data.featureFlags,
                minLeadTimeMinutesToCancelVacancy:
                  data.minLeadTimeMinutesToCancelVacancy,
                maxLeadTimeMinutesToCancelVacancyPart:
                  data.maxLeadTimeMinutesToCancelVacancyPart,
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
                  data.assignmentStart == "before"
                    ? data.minutesRelativeToStartVacancyCanBeFilled * -1
                    : data.minutesRelativeToStartVacancyCanBeFilled,
              },
            });
          }}
        >
          {({ handleSubmit, submitForm, setFieldValue, values }) => (
            <form onSubmit={handleSubmit}>
              <div>
                <Typography variant="h6">{t("Absence types")}</Typography>
                <Grid item xs={2} className={classes.inline}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.featureFlags.includes(
                          FeatureFlag.FullDayAbsences &&
                            FeatureFlag.HalfDayAbsences
                        )}
                        onChange={e => {
                          if (e.target.checked) {
                            values.featureFlags.push(
                              FeatureFlag.FullDayAbsences,
                              FeatureFlag.HalfDayAbsences
                            );
                          } else {
                            values.featureFlags = values.featureFlags.filter(
                              x =>
                                x !== FeatureFlag.FullDayAbsences &&
                                x !== FeatureFlag.HalfDayAbsences
                            );
                          }
                          setFieldValue("featureFlags", values.featureFlags);
                        }}
                        value={values.featureFlags.includes(
                          FeatureFlag.FullDayAbsences &&
                            FeatureFlag.HalfDayAbsences
                        )}
                        color="primary"
                      />
                    }
                    label={t("Full/Half Day")}
                  />
                </Grid>
                <Grid item xs={2} className={classes.inline}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.featureFlags.includes(
                          FeatureFlag.HourlyAbsences
                        )}
                        onChange={e => {
                          if (e.target.checked) {
                            values.featureFlags.push(
                              FeatureFlag.HourlyAbsences
                            );
                          } else {
                            values.featureFlags = values.featureFlags.filter(
                              x => x !== FeatureFlag.HourlyAbsences
                            );
                          }

                          setFieldValue("featureFlags", values.featureFlags);
                        }}
                        value={values.featureFlags.includes(
                          FeatureFlag.HourlyAbsences
                        )}
                        color="primary"
                      />
                    }
                    label={t("Hourly")}
                  />
                </Grid>
              </div>
              <div className={classes.rowMargin}>
                <Typography variant="h6">
                  {t("Absence minimum notice")}
                </Typography>
                <FormHelperText>
                  {t("Employees may not enter an absence that starts within")}
                </FormHelperText>
                <Grid item xs={2}>
                  <FormikDurationInput name="minutesBeforeStartAbsenceCanBeCreated" />
                </Grid>
              </div>
              <div className={classes.rowMargin}>
                <Typography variant="h6">
                  {t("Cancel assignment minimum notice")}
                </Typography>
                <FormHelperText>
                  {t(
                    "Substitutes may not cancel an assignment that starts within"
                  )}
                </FormHelperText>
                <Grid item xs={2}>
                  <FormikDurationInput name="minLeadTimeMinutesToCancelVacancy" />
                </Grid>
              </div>
              <div className={classes.rowMargin}>
                <Typography variant="h6">
                  {t("Single day assignment cancellation window")}
                </Typography>
                <FormHelperText>
                  {t(
                    "Subs who have the permission to cancel will be able to cancel single days of a multiple day assignment within this window"
                  )}
                </FormHelperText>
                <Grid item xs={2}>
                  <FormikDurationInput name="maxLeadTimeMinutesToCancelVacancyPart" />
                </Grid>
              </div>

              <div className={classes.rowMargin}>
                <Typography variant="h6">{t("Fulfillment cutoff")}</Typography>
                <FormHelperText>
                  {t("Allow substitutes to accept an assignment until")}
                </FormHelperText>
                <Grid item xs={2} className={classes.inline}>
                  <FormikDurationInput name="minutesRelativeToStartVacancyCanBeFilled" />
                </Grid>
                <Grid
                  item
                  xs={3}
                  className={[classes.inline, classes.marginLeft].join(" ")}
                >
                  <Select
                    name={"assignmentStart"}
                    value={{
                      value: values.assignmentStart ?? "",
                      label:
                        assignmentStartOptions.find(
                          a => a.value === values.assignmentStart
                        )?.label || "",
                    }}
                    withResetValue={false}
                    options={assignmentStartOptions}
                    onChange={(e: any) => {
                      setFieldValue("assignmentStart", e.value);
                    }}
                    doSort={false}
                    multiple={false}
                  />
                </Grid>
              </div>
              <div className={classes.rowMargin}>
                <Typography variant="h6">
                  {t("Minor assignment conflict threshhold")}
                </Typography>
                <FormHelperText>
                  {t(
                    "Allow administrators with elevated permission to assign a"
                  )}
                </FormHelperText>
                <FormHelperText>
                  {t(
                    "substitute to 2 assignments that overlap by a maximum of"
                  )}
                </FormHelperText>
                <Grid item xs={2}>
                  <Input
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "minorConflictThresholdMinutes",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      fullWidth: true,
                      InputProps: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {t("minutes")}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </div>

              {/*

              Hidden until Request Sub has been implemented.

              <div className={classes.rowMargin}>
                <Typography variant="h6">
                  {t("Requesting Substitutes")}
                </Typography>
                <FormHelperText>
                  {t(
                    "Allow a substitute to be resquested as long as there are at least"
                  )}
                </FormHelperText>
                <Grid item xs={4}>
                  <FormikDurationInput
                    placeholder={t("hh:mm    before the assignment begins")}
                    name="minorConflictThresholdMinutes"
                  />
                </Grid>
              </div>
              <div>
                <FormHelperText>
                  {t(
                    "Reserve the assignment for a requested substitute for at least"
                  )}
                </FormHelperText>
                <Grid item xs={2}>
                  <FormikDurationInput
                    name="minRequestedEmployeeHoldMinutes"
                  />
                </Grid>
              </div>
              <div>
                <FormHelperText>{t("but not more than")}</FormHelperText>
                <Grid item xs={2}>
                  <FormikDurationInput
                    name="maxRequestedEmployeeHoldMinutes"
                  />
                </Grid>
              </div> */}
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
  inline: {
    display: "inline-block",
  },
  marginLeft: {
    marginLeft: theme.spacing(1),
  },
}));
