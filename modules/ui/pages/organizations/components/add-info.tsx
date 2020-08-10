import {
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@material-ui/core";
import { Formik } from "formik";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useIsMobile } from "hooks";
import { OptionTypeBase } from "react-select/src/types";
import Button from "@material-ui/core/Button";
import * as React from "react";
import InfoIcon from "@material-ui/icons/Info";
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
  SeedOrgDataOptionEnum,
  DayConversionInput,
  CountryCode,
  OrganizationType,
  TimeZone,
} from "graphql/server-types.gen";
import { HoursToDaysTable } from "ui/pages/hours-to-days/components/hours-to-days-table";
import { DayConversion } from "ui/pages/hours-to-days/types";

type Props = {
  namePlaceholder: string;
  onSubmit: (organizationCreateInput: OrganizationCreateInput) => Promise<any>;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  staffingProviderOptions: OptionType[];
  timeZoneOptions: OptionType[];
  organizationTypes: OptionType[];
  featureFlagOptions: OptionType[];
  organization?: OrganizationCreateInput;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const overrideStyles = rootStyles();
  const { t } = useTranslation();

  const ensureCatchAll = (conversions: Partial<DayConversion>[]) => {
    const last =
      conversions.length === 0 ? null : conversions[conversions.length - 1];
    if (!last?.maxMinutes || last.maxMinutes < 1440) {
      return conversions.concat({ maxMinutes: 1440 });
    }
    return conversions;
  };

  const initialConversions = ensureCatchAll(
    (
      props?.organization?.config?.vacancyDayConversions ?? [
        { name: "Half Day", maxMinutes: 240, dayEquivalent: 0.5 },
        { name: "Full Day", maxMinutes: 1440, dayEquivalent: 1 },
      ]
    ).map(input =>
      input
        ? {
            name: input.name,
            maxMinutes: input.maxMinutes,
            dayEquivalent: input.dayEquivalent,
          }
        : {}
    )
  );

  const initialValues = {
    name: props?.organization?.name || "",
    externalId: props?.organization?.externalId || "",
    superUserFirstName: props?.organization?.superUserFirstName || "",
    superUserLastName: props?.organization?.superUserLastName || "",
    superUserLoginEmail: props?.organization?.superUserLoginEmail || "",
    seedOptionalData: props?.organization?.seedOptionalData || false,
    relatesToOrganizationId: undefined,
    timeZoneId:
      props?.organization?.timeZoneId || TimeZone.EasternStandardTimeUsCanada,
    featureFlags: props?.organization?.config?.featureFlags || [
      FeatureFlag.Verify,
      FeatureFlag.FullDayAbsences,
      FeatureFlag.HalfDayAbsences,
      FeatureFlag.HourlyAbsences,
    ],
    organizationTypeId:
      props.organization?.config?.organizationTypeId ||
      OrganizationType.Implementing,
    orgUsersMustAcceptEula:
      props.organization?.config?.orgUsersMustAcceptEula || false,
    longTermVacancyThresholdDays:
      props.organization?.config?.longTermVacancyThresholdDays || 20,
    minLeadTimeMinutesToCancelVacancy:
      props.organization?.config?.minLeadTimeMinutesToCancelVacancy || 240,
    maxLeadTimeMinutesToCancelVacancyPart:
      props.organization?.config?.maxLeadTimeMinutesToCancelVacancyPart || 1440,
    minutesBeforeStartAbsenceCanBeCreated:
      props.organization?.config?.minutesBeforeStartAbsenceCanBeCreated || 0,
    /*minLeadTimeMinutesToCancelVacancyWithoutPunishment:
      props.organization?.config
        ?.minLeadTimeMinutesToCancelVacancyWithoutPunishment || 1440,*/
    maxGapMinutesForSameVacancyDetail:
      props.organization?.config?.maxGapMinutesForSameVacancyDetail || 120,
    minAbsenceMinutes: props.organization?.config?.minAbsenceMinutes || 15,
    maxAbsenceDays: props.organization?.config?.maxAbsenceDays || 180,
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
    vacancyDayConversions: initialConversions.slice(0, -1),
    vacancyDayCatchAll: initialConversions[initialConversions.length - 1],
  };

  const deleteVacancyRow = (
    setFieldValue: (field: keyof typeof initialValues, value: any) => void
  ) => (conversions: Partial<DayConversion>[], i: number) => {
    conversions.splice(i, 1);
    setFieldValue("vacancyDayConversions", conversions);
  };

  const addVacancyRow = (
    setFieldValue: (field: keyof typeof initialValues, value: any) => void
  ) => (
    conversions: Partial<DayConversion>[],
    catchAll: Partial<DayConversion>
  ) => {
    catchAll.maxMinutes = undefined;
    conversions.push(catchAll);
    setFieldValue("vacancyDayConversions", conversions);
    setFieldValue("vacancyDayCatchAll", { maxMinutes: 1440 });
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
        vacancyDayConversions: Yup.array(
          Yup.object({
            maxMinutes: Yup.number()
              .min(0, t("Up to must be non-negative"))
              .max(1439, t("Up to must be less than 24 hours"))
              .required(t("Required")),
            name: Yup.string().required(t("Name must be non-empty")),
            dayEquivalent: Yup.number()
              .min(0, t("Day equivalent must be non-negative"))
              .required(t("Required")),
          })
        )
          .test({
            name: "minutesOrderedCheck",
            test: function test(conversions: DayConversion[]) {
              for (let i = 0; i < conversions.length - 1; i++) {
                if (
                  conversions[i].maxMinutes >= conversions[i + 1].maxMinutes
                ) {
                  return new Yup.ValidationError(
                    t("Time durations out of order"),
                    null,
                    `${this.path}.${i + 1}.maxMinutes`
                  );
                }
              }
              return true;
            },
          })
          .test({
            name: "dayOrderedCheck",
            test: function test(conversions: DayConversion[]) {
              for (let i = 0; i < conversions.length - 1; i++) {
                if (
                  conversions[i].dayEquivalent >=
                  conversions[i + 1].dayEquivalent
                ) {
                  return new Yup.ValidationError(
                    t("Day equivalents out of order"),
                    null,
                    `${this.path}.${i + 1}.dayEquivalent`
                  );
                }
              }
              return true;
            },
          }),
        vacancyDayCatchAll: Yup.object({
          maxMinutes: Yup.number()
            .min(0, t("Up to must be non-negative"))
            .required(t("Required")),
          name: Yup.string().required(t("Name must be non-empty")),
          dayEquivalent: Yup.number()
            .min(0, t("Day equivalent must be non-negative"))
            .required(t("Required")),
        }).when(
          "vacancyDayConversions",
          (vacancyDayConversions: Partial<DayConversion>[], schema: any) =>
            schema.test({
              name: "catch all order",
              test: function test(value: Partial<DayConversion>) {
                if (
                  vacancyDayConversions[vacancyDayConversions.length - 1]
                    .dayEquivalent! >= value.dayEquivalent!
                ) {
                  return new Yup.ValidationError(
                    t("Day equivalents out of order"),
                    null,
                    `conversions.${vacancyDayConversions.length -
                      1}.dayEquivalent`
                  );
                }
                return true;
              },
            })
        ),
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
          await props.onSubmit({
            name: data.name.trim(),
            externalId:
              data.externalId.trim().length > 0 ? data.externalId : undefined,
            superUserFirstName: data.superUserFirstName.trim(),
            superUserLastName: data.superUserLastName.trim(),
            superUserLoginEmail: data.superUserLoginEmail,
            timeZoneId: data.timeZoneId,
            seedOrgDataOption: SeedOrgDataOptionEnum.SeedAsynchronously,
            relatesToOrganizationId: data.relatesToOrganizationId ?? undefined,
            seedOptionalData: data.seedOptionalData,
            config: {
              defaultCountry: CountryCode.Us,
              featureFlags: data.featureFlags,
              organizationTypeId: data.organizationTypeId,
              orgUsersMustAcceptEula: data.orgUsersMustAcceptEula,
              longTermVacancyThresholdDays: data.longTermVacancyThresholdDays,
              minLeadTimeMinutesToCancelVacancy:
                data.minLeadTimeMinutesToCancelVacancy,
              maxLeadTimeMinutesToCancelVacancyPart:
                data.maxLeadTimeMinutesToCancelVacancyPart,
              minutesBeforeStartAbsenceCanBeCreated:
                data.minutesBeforeStartAbsenceCanBeCreated,
              /*minLeadTimeMinutesToCancelVacancyWithoutPunishment:
                data.minLeadTimeMinutesToCancelVacancyWithoutPunishment,*/
              maxGapMinutesForSameVacancyDetail:
                data.maxGapMinutesForSameVacancyDetail,
              minAbsenceMinutes: data.minAbsenceMinutes,
              maxAbsenceDays: data.maxAbsenceDays,
              requestedSubCutoffMinutes: data.requestedSubCutoffMinutes,
              minRequestedEmployeeHoldMinutes:
                data.minRequestedEmployeeHoldMinutes,
              maxRequestedEmployeeHoldMinutes:
                data.maxRequestedEmployeeHoldMinutes,
              minorConflictThresholdMinutes: data.minorConflictThresholdMinutes,
              minutesRelativeToStartVacancyCanBeFilled:
                data.minutesRelativeToStartVacancyCanBeFilled,
              vacancyDayConversions: data.vacancyDayConversions.concat(
                data.vacancyDayCatchAll
              ),
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
          errors,
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
                  label={t("Identifier")}
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
                <SelectNew
                  label={t("Staffing Provider")}
                  name={"relatesToOrganizationId"}
                  value={{
                    value: values.relatesToOrganizationId ?? "",
                    label:
                      props.staffingProviderOptions.find(
                        a => a.value === values.relatesToOrganizationId
                      )?.label || "",
                  }}
                  options={props.staffingProviderOptions}
                  onChange={(e: OptionType) => {
                    let selectedValue = null;
                    if (e) {
                      if (Array.isArray(e)) {
                        selectedValue = (e as Array<OptionTypeBase>)[0].value;
                      } else {
                        selectedValue = (e as OptionTypeBase).value;
                      }
                    }
                    setFieldValue("relatesToOrganizationId", selectedValue);
                  }}
                  doSort={false}
                  multiple={false}
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
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={values.seedOptionalData}
                      value={values.seedOptionalData}
                      onChange={e =>
                        setFieldValue("seedOptionalData", e.target.checked)
                      }
                    />
                  }
                  label={t("Seed Optional Data")}
                />
                <Tooltip
                  title={
                    <div className={overrideStyles.tooltip}>
                      {t(
                        "Optional Seeded Data includes: Position Type, Endorsements, Absence Reasons, & Standard Bell Schedule."
                      )}
                    </div>
                  }
                  placement="right-start"
                >
                  <InfoIcon
                    color="primary"
                    style={{
                      fontSize: "16px",
                    }}
                  />
                </Tooltip>
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
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
                <Input
                  label={t("Maximum Lead Time Minutes to Cancel Vacancy Part")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "maxLeadTimeMinutesToCancelVacancyPart",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={6} classes={{ root: overrideStyles.root }}>
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
              <Grid item xs={12} sm={6} classes={{ root: overrideStyles.root }}>
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
              {/*<Grid item xs={12} sm={4} classes={{ root: overrideStyles.root }}>
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
              </Grid>*/}

              <Grid
                item
                container
                xs={12}
                classes={{ root: overrideStyles.row }}
              >
                <SectionHeader title={t("Vacancy Day Conversions")} />
              </Grid>
              <div className={overrideStyles.conversionContainer}>
                <HoursToDaysTable
                  mainPrefix="vacancyDayConversions"
                  mainValues={values.vacancyDayConversions}
                  mainErrors={
                    typeof errors?.vacancyDayConversions === "string" ||
                    errors?.vacancyDayConversions instanceof String
                      ? undefined
                      : errors?.vacancyDayConversions
                  }
                  catchAllValue={values.vacancyDayCatchAll}
                  catchAllPrefix="vacancyDayCatchAll"
                  catchAllError={errors?.vacancyDayCatchAll}
                  addRow={addVacancyRow(setFieldValue)}
                  deleteRow={deleteVacancyRow(setFieldValue)}
                />
              </div>
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
  tooltip: {
    padding: theme.spacing(2),
  },
  conversionContainer: {
    display: "flex",
    flexDirection: "column",
    width: "70%",
    padding: theme.spacing(4),
  },
}));
