import {
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@material-ui/core";
import { Formik } from "formik";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useIsMobile } from "hooks";
import { useMemo, useState } from "react";
import { OptionTypeBase } from "react-select/src/types";
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
  Maybe,
  FeatureFlag,
  SeedOrgDataOptionEnum,
  TimeZone,
} from "graphql/server-types.gen";

type Props = {
  namePlaceholder: string;
  onSubmit: (
    name: string,
    superUserFirstName: string,
    superUserLastName: string,
    superUserLoginEmail: string,
    seedOrgDataOption: SeedOrgDataOptionEnum,
    featureFlags: FeatureFlag[],
    timeZoneId: TimeZone,
    externalId: string | null | undefined
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
  const classes = useStyles();
  const overrideStyles = rootStyles();
  const { t } = useTranslation();
  const [featureFlagsSelected, setFeatureFlagsSelected] = useState<string[]>(
    []
  );

  const initialValues = {
    name: props.organization.name || "",
    externalId: props.organization.externalId || "",
    superUserFirstName: props.organization.superUserFirstName || "",
    superUserLastName: props.organization.superUserLastName || "",
    superUserLoginEmail: props.organization.superUserLoginEmail || "",
    isEdustaffOrg: props.organization.isEdustaffOrg || false,
    timeZoneId: props.organization.timeZoneId || null,
    seedOrgDataOption: props.organization.seedOrgDataOption,
    featureFlagOptions: props.organization.config?.featureFlags,
  };

  //Add more validation
  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Organization name is required")),
        externalId: Yup.string().nullable(),
        superUserFirstName: Yup.string()
          .nullable()
          .required(t("First name is required")),
        superUserLastName: Yup.string()
          .nullable()
          .required(t("Last name is required")),
        superUserLoginEmail: Yup.string()
          .nullable()
          .required(t("email is required")),
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
          console.log(data);
          props.onSubmit(
            data.name,
            data.superUserFirstName,
            data.superUserLastName,
            data.superUserLoginEmail,
            data.seedOrgDataOption,
            data.featureFlags,
            data.timeZoneId,
            data.externalId
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
                  label={t("Seed Data Option")}
                  name={"seedOrgDataOption"}
                  value={{
                    value: values.seedOrgDataOption ?? "",
                    label:
                      props.timeZoneOptions.find(
                        a => a.value === values.seedOrgDataOption
                      )?.label || "",
                  }}
                  options={props.seedOrgDataOptions}
                  onChange={(e: OptionType) => {
                    let selectedValue = null;
                    if (e) {
                      if (Array.isArray(e)) {
                        selectedValue = (e as Array<OptionTypeBase>)[0].value;
                      } else {
                        selectedValue = (e as OptionTypeBase).value;
                      }
                    }
                    setFieldValue("seedOrgDataOption", selectedValue);
                  }}
                  withResetValue={false}
                  multiple={false}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <SelectNew
                  label={t("Feature Flags (FIX ME!!)")}
                  name={"featureFlags"}
                  value={props.featureFlagOptions.filter(
                    e =>
                      e.value &&
                      values?.featureFlagOptions?.includes(e.value.toString())
                  )}
                  withResetValue={false}
                  options={props.featureFlagOptions}
                  onChange={e => {
                    const ids = e.map((v: OptionType) => v.value.toString());
                    setFieldValue("featureFlagOptions", ids);
                    setFeatureFlagsSelected(ids);
                  }}
                  //TODO: Not working.
                  multiple={true}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <SelectNew
                  label={t("Organization Type")}
                  name={"featureFlags"}
                  withResetValue={false}
                  options={props.organizationTypes}
                  multiple={false}
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
              <Grid item xs={12} sm={12}>
                <Divider />
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
            </Grid>
            <Divider />
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

const useStyles = makeStyles(theme => ({
  something: {
    padding: theme.spacing(1),
  },
}));

const rootStyles = makeStyles(theme => ({
  root: {
    padding: `5px 32px 32px 32px !important`,
  },
}));
