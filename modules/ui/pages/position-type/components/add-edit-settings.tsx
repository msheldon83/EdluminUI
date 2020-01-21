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
import { OptionTypeBase } from "react-select/src/types";
import { Input } from "ui/components/form/input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { TextField as FormTextField } from "ui/components/form/text-field";
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
    payTypeId?: AbsenceReasonTrackingTypeId | undefined | null;
    needsReplacement?: NeedsReplacement | undefined | null;
    defaultContractId?: number | undefined | null;
    defaultContract?: {
      id: number;
      name: string;
    };
  };
  submitText: string;
  onSubmit: (
    forPermanentPositions: boolean,
    needsReplacement: NeedsReplacement | undefined | null,
    forStaffAugmentation: boolean,
    minAbsenceDurationMinutes: number,
    payTypeId: AbsenceReasonTrackingTypeId | undefined | null,
    defaultContractId: number | undefined | null
  ) => Promise<unknown>;
  onCancel: () => void;
};

const buildContractOptions = (
  contracts: Array<Contract>,
  positionType: Props["positionType"]
) => {
  // Format the contracts as dropdown options
  const contractOptions = contracts.map(c => {
    return { value: Number(c.id), label: c.name };
  });

  // Handle if the current Position Type is associated with an Expired Contract
  if (
    positionType.defaultContract &&
    !contracts.find(c => Number(c.id) === positionType.defaultContractId)
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
        }}
        onSubmit={async (data, meta) => {
          await props.onSubmit(
            data.forPermanentPositions,
            data.needsReplacement,
            data.forStaffAugmentation,
            data.minAbsenceDurationMinutes,
            data.payTypeId,
            data.defaultContractId
          );
        }}
        validationSchema={yup
          .object()
          .shape({
            minAbsenceDurationMinutes: yup
              .number()
              .required(t("Minimum Absence Duration is required")),
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
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
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
                <FormHelperText error={true} className={classes.appliesToError}>
                  {t("Please specify how you will use this position")}
                </FormHelperText>
              )}
            <div
              className={[
                classes.contractSection,
                isMobile
                  ? classes.mobileSectionSpacing
                  : classes.normalSectionSpacing,
              ].join(" ")}
            >
              <div>{t("Default contract")}</div>
              <SelectNew
                value={contractOptions.find(
                  (c: any) => c.value === values.defaultContractId
                )}
                options={contractOptions}
                onChange={(e: OptionType) => {
                  //TODO: Once the select component is updated,
                  // can remove the Array checking
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
                <Input
                  label={t("Minimum absence duration")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "minAbsenceDurationMinutes",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
                <FormHelperText className={classes.formHelperText}>
                  {t(
                    "The shortest time (in hh:mm) that an employee with this position can be absent."
                  )}
                </FormHelperText>
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
              <div>{t("Pay Type")}</div>
              <SelectNew
                value={payTypeOptions.find(
                  (c: any) => c.value === values.payTypeId
                )}
                options={payTypeOptions}
                multiple={false}
                onChange={(e: OptionType) => {
                  //TODO: Once the select component is updated,
                  // can remove the Array checking
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
            </div>
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
}));
