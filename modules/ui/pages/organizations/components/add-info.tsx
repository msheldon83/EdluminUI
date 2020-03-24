import {
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Formik } from "formik";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useIsMobile } from "hooks";
import { OptionTypeBase } from "react-select/src/types";
import Button from "@material-ui/core/Button";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { Input } from "ui/components/form/input";
import {
  OrganizationCreateInput,
  FeatureFlag,
  DayConversionInput,
  OrganizationType,
  TimeZone,
} from "graphql/server-types.gen";

type Props = {
  namePlaceholder: string;
  onSubmit: (
    name: string,
    superUserFirstName: string,
    superUserLastName: string,
    superUserLoginEmail: string,
    featureFlags: FeatureFlag[],
    organizationTypeId: OrganizationType,
    timeZoneId: TimeZone,
    isEdustaffOrg: boolean,
    orgUsersMustAcceptEula: boolean,
    externalId: string | undefined,
    longTermVacancyThresholdDays: number | undefined,
    minLeadTimeMinutesToCancelVacancy: number | undefined,
    minutesBeforeStartAbsenceCanBeCreated: number | undefined,
    minLeadTimeMinutesToCancelVacancyWithoutPunishment: number | undefined,
    maxGapMinutesForSameVacancyDetail: number | undefined,
    minAbsenceMinutes: number | undefined,
    maxAbsenceDays: number | undefined,
    absenceCreateCutoffTime: number | undefined,
    requestedSubCutoffMinutes: number | undefined,
    minRequestedEmployeeHoldMinutes: number | undefined,
    maxRequestedEmployeeHoldMinutes: number | undefined,
    minorConflictThresholdMinutes: number | undefined,
    minutesRelativeToStartVacancyCanBeFilled: number | undefined,
    vacancyDayConversions: DayConversionInput[] | undefined
  ) => Promise<unknown>;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  seedOrgDataOptions: OptionType[];
  timeZoneOptions: OptionType[];
  organizationTypes: OptionType[];
  featureFlagOptions: OptionType[];
  organization: OrganizationCreateInput;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const overrideStyles = rootStyles();
  const { t } = useTranslation();

  const initialValues = {
    name: props.organization.name || "",
    externalId: props.organization.externalId || "",
    superUserFirstName: props.organization.superUserFirstName || "",
    superUserLastName: props.organization.superUserLastName || "",
    superUserLoginEmail: props.organization.superUserLoginEmail || "",
    isEdustaffOrg: false,
    timeZoneId: props.organization.timeZoneId || null,
    featureFlags: props.organization.config?.featureFlags || null,
    organizationTypeId: props.organization?.config?.organizationTypeId,
    orgUsersMustAcceptEula:
      props.organization?.config?.orgUsersMustAcceptEula || false,
    longTermVacancyThresholdDays:
      props.organization?.config?.longTermVacancyThresholdDays || undefined,
    minLeadTimeMinutesToCancelVacancy:
      props.organization?.config?.minLeadTimeMinutesToCancelVacancy ||
      undefined,
    minutesBeforeStartAbsenceCanBeCreated:
      props.organization?.config?.minutesBeforeStartAbsenceCanBeCreated ||
      undefined,
    minLeadTimeMinutesToCancelVacancyWithoutPunishment:
      props.organization?.config
        ?.minLeadTimeMinutesToCancelVacancyWithoutPunishment || undefined,
    maxGapMinutesForSameVacancyDetail:
      props.organization?.config?.maxGapMinutesForSameVacancyDetail ||
      undefined,
    minAbsenceMinutes:
      props.organization?.config?.minAbsenceMinutes || undefined,
    maxAbsenceDays: props.organization?.config?.maxAbsenceDays || undefined,
    absenceCreateCutoffTime:
      props.organization?.config?.absenceCreateCutoffTime || undefined,
    requestedSubCutoffMinutes:
      props.organization?.config?.requestedSubCutoffMinutes || undefined,
    minRequestedEmployeeHoldMinutes:
      props.organization?.config?.minRequestedEmployeeHoldMinutes || undefined,
    maxRequestedEmployeeHoldMinutes:
      props.organization?.config?.maxRequestedEmployeeHoldMinutes || undefined,
    minorConflictThresholdMinutes:
      props.organization?.config?.minorConflictThresholdMinutes || undefined,
    minutesRelativeToStartVacancyCanBeFilled:
      props.organization?.config?.minutesRelativeToStartVacancyCanBeFilled ||
      undefined,
    vacancyDayConversions:
      props.organization?.config?.vacancyDayConversions || [],
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("* Required *")),
        externalId: Yup.string().nullable(),
        superUserFirstName: Yup.string()
          .nullable()
          .required(t("* Required *")),
        superUserLastName: Yup.string()
          .nullable()
          .required(t("* Required *")),
        superUserLoginEmail: Yup.string()
          .email()
          .nullable()
          .required(t("* Required *")),
        timeZoneId: Yup.string()
          .nullable()
          .required(t("* Required *")),
        organizationTypeId: Yup.string()
          .nullable()
          .required(t("* Required *")),
        featureFlags: Yup.array(Yup.string()).required(t("* Required *")),
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
          await props.onSubmit(
            data.name,
            data.superUserFirstName,
            data.superUserLastName,
            data.superUserLoginEmail,
            data.featureFlags,
            data.organizationTypeId,
            data.timeZoneId,
            data.isEdustaffOrg,
            data.orgUsersMustAcceptEula,
            data.externalId,
            data.longTermVacancyThresholdDays,
            data.minLeadTimeMinutesToCancelVacancy,
            data.minutesBeforeStartAbsenceCanBeCreated,
            data.minLeadTimeMinutesToCancelVacancyWithoutPunishment,
            data.maxGapMinutesForSameVacancyDetail,
            data.minAbsenceMinutes,
            data.maxAbsenceDays,
            data.absenceCreateCutoffTime,
            data.requestedSubCutoffMinutes,
            data.minRequestedEmployeeHoldMinutes,
            data.maxRequestedEmployeeHoldMinutes,
            data.minorConflictThresholdMinutes,
            data.minutesRelativeToStartVacancyCanBeFilled,
            data.vacancyDayConversions.length > 0
              ? data.vacancyDayConversions
              : undefined
          );
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
            <Grid container spacing={isMobile ? 2 : 8}>
              <Grid item xs={12} sm={6}>
                <Input
                  label={t("Organization name")}
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
              <Grid item xs={12} sm={6}>
                <SelectNew
                  label={t("Time Zone")}
                  name={"timeZoneId"}
                  value={{
                    value: values.timeZoneId ?? "",
                    label:
                      props.timeZoneOptions.find(
                        a => a.value === values.timeZoneId
                      )?.label || "",
                  }}
                  options={props.timeZoneOptions}
                  onChange={(e: OptionType) => {
                    let selectedValue = null;
                    if (e) {
                      if (Array.isArray(e)) {
                        selectedValue = (e as Array<OptionTypeBase>)[0].value;
                      } else {
                        selectedValue = (e as OptionTypeBase).value;
                      }
                    }
                    setFieldValue("timeZoneId", selectedValue);
                  }}
                  withResetValue={false}
                  multiple={false}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <SelectNew
                  label={t("Organization Type")}
                  name={"organizationTypeId"}
                  value={{
                    value: values.organizationTypeId ?? "",
                    label:
                      props.organizationTypes.find(
                        a => a.value === values.organizationTypeId
                      )?.label || "",
                  }}
                  onChange={(e: OptionType) => {
                    let selectedValue = null;
                    if (e) {
                      if (Array.isArray(e)) {
                        selectedValue = (e as Array<OptionTypeBase>)[0].value;
                      } else {
                        selectedValue = (e as OptionTypeBase).value;
                      }
                    }
                    setFieldValue("organizationTypeId", selectedValue);
                  }}
                  withResetValue={false}
                  doSort={false}
                  options={props.organizationTypes}
                  multiple={false}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("External Id")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "externalId",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Super User First Name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g John`,
                    name: "superUserFirstName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Super User Last Name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g Smith`,
                    name: "superUserLastName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Super User Email")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g johnsmith@fake.com`,
                    name: "superUserLoginEmail",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <SelectNew
                  label={t("Feature Flags")}
                  name={"featureFlags"}
                  value={props.featureFlagOptions.filter(
                    e =>
                      e.value && values.featureFlags?.some(v => v === e.value)
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
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
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
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.orgUsersMustAcceptEula}
                      onChange={e => {
                        setFieldValue(
                          "orgUsersMustAcceptEula",
                          e.target.checked
                        );
                      }}
                      value={values.orgUsersMustAcceptEula}
                      color="primary"
                    />
                  }
                  label={t("Users Must Accept Eula?")}
                />
              </Grid>
              <Grid item xs={12}>
                <SectionHeader title={t("Non-required setup info")} />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Minimum Absence Minutes")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minAbsenceMinutes",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Max Absence Days")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "maxAbsenceDays",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Absence Create Cutoff Time")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "absenceCreateCutoffTime",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Long Term Vacancy Threshold Days")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "longTermVacancyThresholdDays",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Minutes before Start Absence can be Created")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minutesBeforeStartAbsenceCanBeCreated",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Max Gap Minutes For Same Vacancy Detail")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "maxGapMinutesForSameVacancyDetail",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Min. minutes to cancel Vacancy w/o punishment")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minLeadTimeMinutesToCancelVacancyWithoutPunishment",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                    helperText: t(
                      "Minimum Lead Time Minutes To Cancel Vacancy Without Punishment"
                    ),
                  }}
                />
              </Grid>

              <Grid
                item
                container
                xs={12}
                classes={{ root: overrideStyles.row }}
              >
                <SectionHeader title={t("Vacancy Day Conversions")} />
              </Grid>
              <Grid
                xs={12}
                item
                container
                classes={{ root: overrideStyles.row }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={e => {
                    const value: DayConversionInput = {
                      name: "",
                      maxMinutes: 0,
                      dayEquivalent: 0,
                    };

                    values.vacancyDayConversions.push(value);
                    setFieldValue(
                      "vacancyDayConversions",
                      values.vacancyDayConversions
                    );
                  }}
                >
                  {t("Add")}
                </Button>
              </Grid>
              {values.vacancyDayConversions.length > 0 && (
                <Grid
                  container
                  item
                  xs={12}
                  classes={{ root: overrideStyles.row }}
                >
                  <Grid item xs={3} classes={{ root: overrideStyles.cell }}>
                    <label>Name</label>
                  </Grid>
                  <Grid item xs={2} classes={{ root: overrideStyles.cell }}>
                    <label>Day Equivalent</label>
                  </Grid>
                  <Grid item xs={2} classes={{ root: overrideStyles.cell }}>
                    <label>Max Minutes</label>
                  </Grid>
                </Grid>
              )}

              {values.vacancyDayConversions.map((n, i) => (
                <Grid
                  item
                  key={i}
                  container
                  xs={12}
                  classes={{ root: overrideStyles.row }}
                >
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    classes={{ root: overrideStyles.cell }}
                  >
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        margin: isMobile ? "normal" : "none",
                        variant: "outlined",
                        fullWidth: true,
                        name: `vacancyDayConversions[${i}].name`,
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={2}
                    classes={{ root: overrideStyles.cell }}
                  >
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        margin: isMobile ? "normal" : "none",
                        variant: "outlined",
                        fullWidth: true,
                        name: `vacancyDayConversions[${i}].maxMinutes`,
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={2}
                    classes={{ root: overrideStyles.cell }}
                  >
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        margin: isMobile ? "normal" : "none",
                        variant: "outlined",
                        name: `vacancyDayConversions[${i}].dayEquivalent`,
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={3}
                    classes={{ root: overrideStyles.cell }}
                  >
                    <Button
                      onClick={() => {
                        values.vacancyDayConversions.splice(i, 1);
                        setFieldValue(
                          "vacancyDayConversions",
                          values.vacancyDayConversions
                        );
                      }}
                      variant="contained"
                      size="small"
                    >
                      {t("Remove")}
                    </Button>
                  </Grid>
                </Grid>
              ))}
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

const rootStyles = makeStyles(theme => ({
  root: {
    padding: `5px 32px 32px 32px !important`,
  },
  row: {
    padding: `5px 32px 5px 32px !important`,
  },
  cell: {
    paddingRight: "15px !important",
  },
}));
