import { makeStyles } from "@material-ui/styles";
import { Formik } from "formik";
import {
  AbsenceReasonTrackingTypeId,
  AssignmentType,
} from "graphql/server-types.gen";
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

type Props = {
  description?: string;
  allowNegativeBalance: boolean;
  isBucket: boolean;
  appliesToAssignmentTypes?: AssignmentType;
  absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
  onSubmit: (updatedValues: {
    allowNegativeBalance: boolean;
    isBucket: boolean;
    description?: string;
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
    appliesToAssignmentTypes?: AssignmentType;
  }) => Promise<void>;
  onCancel: () => void;
};

export const AbsenceReasonSettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const initialValues = pick(props, [
    "description",
    "allowNegativeBalance",
    "isBucket",
    "absenceReasonTrackingTypeId",
    "appliesToAssignmentTypes",
  ]);

  return (
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

            <Typography variant="h6" className={classes.label}>
              {t("What types of assignments does this reason apply to?")}
            </Typography>
            <RadioGroup
              aria-label="appliesToAssignmentTypes"
              name="appliesToAssignmentTypes"
              value={values.appliesToAssignmentTypes || ""}
              onChange={e => {
                setFieldValue("appliesToAssignmentTypes", e.target.value);
              }}
              row={!isMobile}
            >
              <FormControlLabel
                value={AssignmentType.ContractAssignment}
                control={<Radio color="primary" />}
                label={t("Contract Assignment")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={AssignmentType.DailyAssignment}
                control={<Radio color="primary" />}
                label={t("Daily Assignment")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={AssignmentType.LongTermAssignment}
                control={<Radio color="primary" />}
                label={t("Long Term Assignment")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={AssignmentType.None}
                control={<Radio color="primary" />}
                label={t("None")}
                labelPlacement="end"
              />
            </RadioGroup>

            <Typography variant="h6" className={classes.label}>
              {t("How should the balances for this reason be tracked?")}
            </Typography>
            <RadioGroup
              aria-label="absenceReasonTrackingTypeId"
              name="absenceReasonTrackingTypeId"
              value={values.absenceReasonTrackingTypeId || ""}
              onChange={e => {
                setFieldValue("absenceReasonTrackingTypeId", e.target.value);
              }}
              row={!isMobile}
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

            <Typography variant="h6" className={classes.label}>
              {t("Does this absence reason allow negative balances?")}
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
              {t("Is this absence reason a bucket?")}
            </Typography>
            <RadioGroup
              aria-label="isBucket"
              name="isBucket"
              value={values.isBucket}
              onChange={e => {
                setFieldValue("isBucket", e.target.value === "true");
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
  content: { marginTop: theme.spacing(2) },
  label: {
    marginTop: theme.spacing(4),
  },
}));
