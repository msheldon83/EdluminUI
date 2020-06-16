import { makeStyles } from "@material-ui/styles";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import { pick } from "lodash-es";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import * as yup from "yup";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useAbsenceReasonCategoryOptions } from "reference-data/absence-reason-categories";
import { OptionTypeBase } from "react-select";

type Props = {
  description?: string;
  code?: string;
  allowNegativeBalance: boolean;
  isRestricted: boolean;
  requireNotesToAdmin: boolean;
  requiresApproval: boolean;
  onSubmit: (updatedValues: {
    allowNegativeBalance: boolean;
    isRestricted: boolean;
    description?: string;
    code?: string;
    requireNotesToAdmin: boolean;
    requiresApproval: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  className?: string;
  absenceReasonCategoryId?: string;
  orgId: string;
};

export const AbsenceReasonSettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const initialValues = pick(props, [
    "description",
    "code",
    "allowNegativeBalance",
    "isRestricted",
    "requireNotesToAdmin",
    "absenceReasonCategoryId",
    "requiresApproval",
  ]);

  const absenceReasonCategoryOptions = useAbsenceReasonCategoryOptions(
    props.orgId
  );

  return (
    <Section className={props.className}>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={initialValues}
        onSubmit={props.onSubmit}
        validationSchema={yup.object().shape({
          allowNegativeBalances: yup.boolean(),
          isRestricted: yup.boolean(),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Input
              label={t("Description")}
              InputComponent={FormTextField}
              inputComponentProps={{
                name: "description",
                margin: isMobile ? "normal" : "none",
                variant: "outlined",
                fullWidth: true,
              }}
            />
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
            <Typography variant="h6" className={classes.label}>
              {t(
                "Should a balance be allowed to go negative for this absence reason?"
              )}
            </Typography>
            <RadioGroup
              aria-label="allowNegativeBalances"
              name="allowNegativeBalances"
              value={values.allowNegativeBalance}
              onChange={e => {
                setFieldValue(
                  "allowNegativeBalance",
                  e.target.value === "true"
                );
              }}
              row={!isMobile}
            >
              <FormControlLabel
                value={false}
                control={<Radio color="primary" />}
                label={t("No")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={true}
                control={<Radio color="primary" />}
                label={t("Yes")}
                labelPlacement="end"
              />
            </RadioGroup>

            <Typography variant="h6" className={classes.label}>
              {t("Is this absence reason restricted?")}
            </Typography>
            <RadioGroup
              aria-label="isRestricted"
              name="isRestricted"
              value={values.isRestricted}
              onChange={e => {
                setFieldValue("isRestricted", e.target.value === "true");
              }}
              row={!isMobile}
            >
              <FormControlLabel
                value={false}
                control={<Radio color="primary" />}
                label={t("No")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={true}
                control={<Radio color="primary" />}
                label={t("Yes")}
                labelPlacement="end"
              />
            </RadioGroup>

            <Typography variant="h6" className={classes.label}>
              {t("Require notes to administrator?")}
            </Typography>
            <RadioGroup
              aria-label="requireNotesToAdmin"
              name="requireNotesToAdmin"
              value={values.requireNotesToAdmin}
              onChange={e => {
                setFieldValue("requireNotesToAdmin", e.target.value === "true");
              }}
              row={!isMobile}
            >
              <FormControlLabel
                value={false}
                control={<Radio color="primary" />}
                label={t("No")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={true}
                control={<Radio color="primary" />}
                label={t("Yes")}
                labelPlacement="end"
              />
            </RadioGroup>
            <Typography variant="h6" className={classes.label}>
              {t("Requires approval?")}
            </Typography>
            <RadioGroup
              aria-label="requiresApproval"
              name="requiresApproval"
              value={values.requiresApproval}
              onChange={e => {
                setFieldValue("requiresApproval", e.target.value === "true");
              }}
              row={!isMobile}
            >
              {" "}
              <FormControlLabel
                value={false}
                control={<Radio color="primary" />}
                label={t("No")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={true}
                control={<Radio color="primary" />}
                label={t("Yes")}
                labelPlacement="end"
              />
            </RadioGroup>
            <Typography variant="h6" className={classes.label}>
              {t("Which category is this absence reason a part of?")}
            </Typography>
            <SelectNew
              name="absenceReasonCategoryId"
              className={classes.categorySelector}
              multiple={false}
              options={absenceReasonCategoryOptions}
              value={{
                value: values.absenceReasonCategoryId ?? "",
                label:
                  absenceReasonCategoryOptions.find(
                    (c: any) => c.value === values.absenceReasonCategoryId
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
                setFieldValue("absenceReasonCategoryId", selectedValue);
              }}
            />

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
  label: {
    marginTop: theme.spacing(4),
  },
  categorySelector: {
    width: theme.typography.pxToRem(500),
  },
}));
