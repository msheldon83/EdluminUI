import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import {
  makeStyles,
  Checkbox,
  Radio,
  FormControlLabel,
  FormHelperText,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import * as yup from "yup";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { NeedsReplacement, Contract, Maybe } from "graphql/server-types.gen";
import { ActionButtons } from "./action-buttons";
import { Select, SelectValueType } from "ui/components/form/select";
import { GetAllActiveContracts } from "../graphql/get-all-active-contracts.gen";
import { OptionTypeBase } from "react-select/src/types";
import { TFunction } from "i18next";

type Props = {
  orgId: string;
  positionType: {
    forPermanentPositions: boolean;
    forStaffAugmentation: boolean;
    minAbsenceDurationMinutes: number;
    needsReplacement?: NeedsReplacement | undefined | null;
    defaultContractId?: number | undefined | null;
    defaultContract?: {
      id: number;
      name: string;
    };
  };
  submitText: string;
  onSubmit: (forPermanentPositions: boolean,
    needsReplacement: NeedsReplacement | undefined | null,
    forStaffAugmentation: boolean,
    minAbsenceDurationMinutes: number,
    defaultContractId: number | undefined | null) => Promise<unknown>;
  onCancel: () => void;
};

const buildContractOptions = (
  contracts: Array<Contract>,
  positionType: Props["positionType"],
  t: TFunction
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

  const contractOptionsWithNoneSelected = [{ value: 0, label: t("None Selected").toString() }, ...contractOptions]

  return contractOptionsWithNoneSelected;
};

export const Settings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  const getAllActiveContracts = useQueryBundle(GetAllActiveContracts, {
    variables: { orgId: props.orgId },
  });
  if (getAllActiveContracts.state === "LOADING") {
    return <></>;
  }

  const allActiveContracts: any = getAllActiveContracts?.data?.contract?.all || [];
  const contractOptions = buildContractOptions(
    allActiveContracts,
    props.positionType,
    t
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
        }}
        onSubmit={(data, meta) => {
          props.onSubmit(
            data.forPermanentPositions,
            data.needsReplacement,
            data.forStaffAugmentation,
            data.minAbsenceDurationMinutes,
            data.defaultContractId
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
                />
              }
              label={t("Use for vacancies")}
            />
            <FormHelperText className={classes.useForEmployeesSubItems}>
              {t(
                "Will you need to request a substitute without an employee being absent?"
              )}
            </FormHelperText>
            <div className={classes.contractSection}>
              <div>{t("Default contract")}</div>
              <Select
                value={contractOptions.find(
                  (c: any) => c.value === values.defaultContractId
                )}
                label=""
                options={contractOptions}
                onChange={(e: SelectValueType) => {
                  //TODO: Once the select component is updated,
                  // can remove the Array checking
                  let selectedValue = null;
                  if (Array.isArray(e)) {
                    selectedValue = (e as Array<OptionTypeBase>)[0].value;
                  } else {
                    selectedValue = (e as OptionTypeBase).value;
                  }
                  setFieldValue("defaultContractId", selectedValue);
                }}
              />
              <FormHelperText>
                {t(
                  "Positions of this type will likely be associated with this contract"
                )}
              </FormHelperText>
            </div>
            <div className={classes.minAbsenceSection}>
              <Typography variant="h6">
                {t("How should the system behave for this position?")}
              </Typography>
              <FormHelperText>
                {t(
                  "Don’t worry, you will be able to change these settings for an individual employee"
                )}
              </FormHelperText>
              <div className={classes.minAbsenceDurationLabel}>
                {t("Minimum absence duration")}
              </div>
              <FormTextField
                name="minAbsenceDurationMinutes"
                margin={isMobile ? "normal" : "none"}
                variant="outlined"
                helperText={t(
                  "The shortest time that an employee with this position can be absent."
                )}
                fullWidth
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
  contractSection: {
    marginTop: theme.spacing(6),
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceSection: {
    marginTop: theme.spacing(6),
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceDurationLabel: {
    marginTop: theme.spacing(2),
  },
}));
