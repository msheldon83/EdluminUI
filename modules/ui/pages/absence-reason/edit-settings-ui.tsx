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
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { RadioGroup, Radio, FormControlLabel } from "@material-ui/core";

type Props = {
  id: string;
  name: string;
  rowVersion: string;
  description?: string;
  allowNegativeBalance: boolean;
  expired: boolean;
  validUntil: string;
  isBucket: boolean;
  absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
};

export const AbsenceReasonEditSettingsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const initialValues = pick(props, [
    "id",
    "name",
    "rowVersion",
    "description",
    "allowNegativeBalance",
    "expired",
    "validUntil",
    "isBucket",
    "absenceReasonTrackingTypeId",
  ]);

  return (
    <>
      <PageTitle title={t("Absence Reason")} withoutHeading={!isMobile} />
      <PageHeader text={props.name} label={t("Name")} />

      <Section className={classes.content}>
        <SectionHeader title={t("Settings")} />
        <Formik initialValues={initialValues} onSubmit={props.onSubmit}>
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

              <RadioGroup
                aria-label="absenceReasonTrackingTypeId"
                name="absenceReasonTrackingTypeId"
                value={values.absenceReasonTrackingTypeId}
                onChange={e => {
                  setFieldValue("absenceReasonTrackingTypeId", e.target.value);
                }}
                row={!isMobile}
                // className={classes.useForEmployeesSubItems}
              >
                <FormControlLabel
                  value={AbsenceReasonTrackingTypeId.Hourly}
                  control={<Radio color="primary" />}
                  label={t("Hourly")}
                  labelPlacement="end"
                />
                <FormControlLabel
                  value={AbsenceReasonTrackingTypeId.Daily}
                  control={<Radio color="primary" />}
                  label={t("Daily")}
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
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: { marginTop: theme.spacing(2) },
}));
