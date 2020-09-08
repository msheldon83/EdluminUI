import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import { Formik } from "formik";
import { useQueryBundle } from "graphql/hooks";
import {
  Contract,
  NeedsReplacement,
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { usePayCodes } from "reference-data/pay-codes";
import { OptionTypeBase } from "react-select/src/types";
import { FormikDurationInput } from "ui/components/form/formik-duration-input";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Select, OptionType } from "ui/components/form/select";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { GetAllActiveContracts } from "../graphql/get-all-active-contracts.gen";
import { useMemo } from "react";

type Props = {
  orgId: string;
  positionType: {
    forPermanentPositions: boolean;
    forStaffAugmentation: boolean;
    minAbsenceDurationMinutes: number;
    absenceReasonTrackingTypeId: AbsenceReasonTrackingTypeId;
    payTypeId?: AbsenceReasonTrackingTypeId | undefined | null;
    needsReplacement?: NeedsReplacement | undefined | null;
    defaultContractId?: string | undefined | null;
    payCodeId?: string | undefined | null;
    defaultContract?: {
      id: string;
      name: string;
    };
    code?: string | null;
  };
  submitText: string;
  onSubmit: (
    forPermanentPositions: boolean,
    needsReplacement: NeedsReplacement | undefined | null,
    forStaffAugmentation: boolean,
    minAbsenceDurationMinutes: number,
    absenceReasonTrackingTypeId: AbsenceReasonTrackingTypeId,
    payTypeId: AbsenceReasonTrackingTypeId | undefined | null,
    payCodeId: string | undefined | null,
    defaultContractId: string | undefined | null,
    code: string | undefined | null
  ) => Promise<unknown>;
  onCancel: () => void;
};

const buildContractOptions = (
  contracts: Array<Contract>,
  positionType: Props["positionType"]
) => {
  // Format the contracts as dropdown options
  const contractOptions = contracts.map(c => {
    return { value: c.id, label: c.name };
  });

  // Handle if the current Position Type is associated with an Expired Contract
  if (
    positionType.defaultContract &&
    !contracts.find(c => c.id === positionType.defaultContractId)
  ) {
    contractOptions.push({
      value: positionType.defaultContract.id,
      label: positionType.defaultContract.name,
    });
  }

  return contractOptions;
};

export const Settings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const payTypeOptions = useMemo(() => {
    return [
      {
        value: AbsenceReasonTrackingTypeId.Daily,
        label: t("Daily"),
      },
      {
        value: AbsenceReasonTrackingTypeId.Hourly,
        label: t("Hourly"),
      },
    ];
  }, [t]);

  const getPayCodes = usePayCodes(props.orgId);
  const payCodeOptions = useMemo(
    () => getPayCodes.map(c => ({ label: c.name, value: c.id })),
    [getPayCodes]
  );

  const getAllActiveContracts = useQueryBundle(GetAllActiveContracts, {
    variables: { orgId: props.orgId },
  });
  if (getAllActiveContracts.state === "LOADING") {
    return <></>;
  }

  const allActiveContracts: any =
    getAllActiveContracts?.data?.contract?.all || [];

  const contractOptions = buildContractOptions(
    allActiveContracts,
    props.positionType
  );

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
          defaultContractId: props.positionType.defaultContractId,
          payTypeId: props.positionType.payTypeId,
          payCodeId: props.positionType.payCodeId,
          code: props.positionType.code,
          absenceReasonTrackingTypeId:
            props.positionType.absenceReasonTrackingTypeId,
        }}
        onSubmit={async (data, meta) => {
          await props.onSubmit(
            data.forPermanentPositions,
            data.needsReplacement,
            data.forStaffAugmentation,
            data.minAbsenceDurationMinutes,
            data.absenceReasonTrackingTypeId,
            data.payTypeId ? data.payTypeId : null,
            data.payCodeId ? data.payCodeId : null,
            data.defaultContractId ? data.defaultContractId : null,
            data.code
          );
        }}
        validationSchema={yup
          .object()
          .shape({
            minAbsenceDurationMinutes: yup
              .number()
              .required(t("Minimum Absence Duration is required")),
            absenceReasonTrackingTypeId: yup
              .string()
              .nullable()
              .test("typeSelected", t("A type must be selected"), function(
                value
              ) {
                if (!value) {
                  return this.createError({
                    message: t("A type must be selected"),
                  });
                }
                return true;
              }),
          })
          .test({
            name: "forStaffAugmentationCheck",
            test: value => {
              if (value.forStaffAugmentation || value.forPermanentPositions) {
                return true;
              }

              return new yup.ValidationError(
                "Error",
                null,
                "forStaffAugmentation"
              );
            },
          })
          .test({
            name: "forPermanentPositionsCheck",
            test: value => {
              if (value.forStaffAugmentation || value.forPermanentPositions) {
                return true;
              }

              return new yup.ValidationError(
                "Error",
                null,
                "forPermanentPositions"
              );
            },
          })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Typography variant="h6">
                {t("How will you use this position?")}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.forPermanentPositions}
                    onChange={e => {
                      setFieldValue("forPermanentPositions", e.target.checked);
                    }}
                    value={values.forPermanentPositions}
                    color="primary"
                    className={
                      errors && errors.forPermanentPositions
                        ? classes.checkboxError
                        : ""
                    }
                  />
                }
                label={t("Use for employees")}
              />
              <FormHelperText className={classes.useForEmployeesSubItems}>
                {t("Will you assign employees to this position?")}
              </FormHelperText>
              <div
                className={[
                  classes.useForEmployeesSubItems,
                  classes.needSubLabel,
                ].join(" ")}
              >
                {t("Need substitute")}
              </div>
              <RadioGroup
                aria-label="needsReplacement"
                name="needsReplacement"
                value={values.needsReplacement}
                onChange={e => {
                  setFieldValue("needsReplacement", e.target.value);
                }}
                row={!isMobile}
                className={classes.useForEmployeesSubItems}
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
                  label={t("Employee should specify")}
                  labelPlacement="end"
                />
              </RadioGroup>
              <FormHelperText className={classes.useForEmployeesSubItems}>
                {t(
                  "Will employees working this position usually need to have a substitute?"
                )}
              </FormHelperText>
              <FormHelperText className={classes.useForEmployeesSubItems}>
                {t(
                  "Don’t worry, you will be able to change this for an individual employee."
                )}
              </FormHelperText>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.forStaffAugmentation}
                    onChange={e => {
                      setFieldValue("forStaffAugmentation", e.target.checked);
                    }}
                    value={values.forStaffAugmentation}
                    color="primary"
                    className={
                      errors && errors.forStaffAugmentation
                        ? classes.checkboxError
                        : ""
                    }
                  />
                }
                label={t("Use for vacancies")}
              />
              <FormHelperText className={classes.useForEmployeesSubItems}>
                {t(
                  "Will you need to request a substitute without an employee being absent?"
                )}
              </FormHelperText>
              {errors &&
                errors.forPermanentPositions &&
                errors.forStaffAugmentation && (
                  <FormHelperText
                    error={true}
                    className={classes.appliesToError}
                  >
                    {t("Please specify how you will use this position")}
                  </FormHelperText>
                )}
              <div className={classes.codeSection}>
                <Input
                  label={t("Code")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "code",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </div>
              <div
                className={[
                  classes.contractSection,
                  isMobile
                    ? classes.mobileSectionSpacing
                    : classes.normalSectionSpacing,
                ].join(" ")}
              >
                <div>{t("Default contract")}</div>
                <Select
                  value={{
                    value: values.defaultContractId ?? "",
                    label:
                      contractOptions.find(
                        a => a.value === values.defaultContractId
                      )?.label || "",
                  }}
                  options={contractOptions}
                  onChange={(e: OptionType) => {
                    let selectedValue = null;
                    if (e) {
                      if (Array.isArray(e)) {
                        selectedValue = (e as Array<OptionTypeBase>)[0].value;
                      } else {
                        selectedValue = (e as OptionTypeBase).value;
                      }
                    }
                    setFieldValue("defaultContractId", selectedValue);
                  }}
                  multiple={false}
                />
                <FormHelperText>
                  {t(
                    "Positions of this type will likely be associated with this contract"
                  )}
                </FormHelperText>
              </div>
              <div
                className={[
                  classes.minAbsenceSection,
                  isMobile
                    ? classes.mobileSectionSpacing
                    : classes.normalSectionSpacing,
                ].join(" ")}
              >
                <Typography variant="h6">
                  {t("How should the system behave for this position?")}
                </Typography>
                <FormHelperText>
                  {t(
                    "Don’t worry, you will be able to change these settings for an individual employee"
                  )}
                </FormHelperText>
                <div className={classes.minAbsenceDurationLabel}>
                  <FormikDurationInput
                    label={t("Minimum absence duration")}
                    name="minAbsenceDurationMinutes"
                    inputStatus={
                      errors.minAbsenceDurationMinutes ? "error" : "default"
                    }
                    validationMessage={errors.minAbsenceDurationMinutes}
                    helperMessage={t(
                      "The shortest time (hh:mm) that an employee with this position can be absent."
                    )}
                  />
                </div>
              </div>
              <div
                className={[
                  classes.payTypeSection,
                  isMobile
                    ? classes.mobileSectionSpacing
                    : classes.normalSectionSpacing,
                ].join(" ")}
              >
                <div>{t("Pay type")}</div>
                <Select
                  value={{
                    value: values.payTypeId ?? "",
                    label:
                      payTypeOptions.find(a => a.value === values.payTypeId)
                        ?.label || "",
                  }}
                  options={payTypeOptions}
                  multiple={false}
                  onChange={(e: OptionType) => {
                    let selectedValue = null;
                    if (e) {
                      if (Array.isArray(e)) {
                        selectedValue = (e as Array<OptionTypeBase>)[0].value;
                      } else {
                        selectedValue = (e as OptionTypeBase).value;
                      }
                    }
                    setFieldValue("payTypeId", selectedValue);
                  }}
                />
                <div className={classes.paddingTop}>
                  <div>{t("Tracking type")}</div>
                  <Select
                    name="absenceReasonTrackingTypeId"
                    value={{
                      value: values.absenceReasonTrackingTypeId ?? "",
                      label:
                        payTypeOptions
                          .find(
                            a => a.value === values.absenceReasonTrackingTypeId
                          )
                          ?.label.toString() || "",
                    }}
                    options={payTypeOptions}
                    withResetValue={false}
                    multiple={false}
                    inputStatus={
                      errors.absenceReasonTrackingTypeId ? "error" : "default"
                    }
                    onChange={(value: any) => {
                      setFieldValue("absenceReasonTrackingTypeId", value.value);
                    }}
                  />
                </div>
                <div className={classes.paddingTop}>
                  <div>{t("Pay code")}</div>
                  <Select
                    value={{
                      value: values.payCodeId ?? "",
                      label:
                        payCodeOptions.find(a => a.value === values.payCodeId)
                          ?.label || "",
                    }}
                    options={payCodeOptions}
                    multiple={false}
                    onChange={(e: OptionType) => {
                      let selectedValue = null;
                      if (e) {
                        if (Array.isArray(e)) {
                          selectedValue = (e as Array<OptionTypeBase>)[0].value;
                        } else {
                          selectedValue = (e as OptionTypeBase).value;
                        }
                      }
                      setFieldValue("payCodeId", selectedValue);
                    }}
                  />
                </div>
              </div>
              <ActionButtons
                submit={{ text: props.submitText, execute: submitForm }}
                cancel={{ text: t("Cancel"), execute: props.onCancel }}
              />
            </form>
          );
        }}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  useForEmployeesSubItems: {
    marginLeft: theme.spacing(4),
  },
  needSubLabel: {
    marginTop: theme.spacing(2),
  },
  mobileSectionSpacing: {
    marginTop: theme.spacing(2),
  },
  formHelperText: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  normalSectionSpacing: {
    marginTop: theme.spacing(6),
  },
  contractSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  paddingTop: {
    paddingTop: "20px",
  },
  minAbsenceSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceDurationLabel: {
    marginTop: theme.spacing(2),
  },
  checkboxError: {
    color: theme.palette.error.main,
  },
  appliesToError: {
    marginTop: theme.spacing(2),
    fontSize: theme.typography.pxToRem(14),
  },
  payTypeSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  codeSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
    marginTop: theme.spacing(2),
  },
}));
