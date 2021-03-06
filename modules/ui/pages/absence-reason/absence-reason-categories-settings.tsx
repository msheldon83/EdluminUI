import { makeStyles } from "@material-ui/styles";
import { Formik } from "formik";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
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

type Props = {
  description?: string;
  code?: string;
  allowNegativeBalance: boolean;
  onSubmit: (updatedValues: {
    allowNegativeBalance: boolean;
    description?: string;
    code?: string;
  }) => Promise<void>;
  onCancel: () => void;
  className?: string;
  orgId: string;
};

export const AbsenceReasonCategorySettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const initialValues = pick(props, [
    "description",
    "code",
    "allowNegativeBalance",
  ]);

  return (
    <Section className={props.className}>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={initialValues}
        onSubmit={props.onSubmit}
        validationSchema={yup.object().shape({
          allowNegativeBalances: yup.boolean(),
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
                "Should a balance be allowed to go negative for this absence reason category?"
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
}));
