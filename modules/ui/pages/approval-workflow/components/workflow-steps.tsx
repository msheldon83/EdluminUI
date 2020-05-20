import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import {
  ApprovalWorkflowType,
  ApprovalWorkflowStepInput,
} from "graphql/server-types.gen";
import { AbsenceBasicInfo } from "./absence-basic-info";
import { VacancyBasicInfo } from "./vacancy-basic-info";
import { exampleSteps } from "../types";
import { StepsGraph } from "./graph";

type Props = {
  onCancel: () => void;
  onSave: (steps: ApprovalWorkflowStepInput[]) => void;
  steps: ApprovalWorkflowStepInput[];
  workflowType: ApprovalWorkflowType;
  orgId: string;
};

export const WorkflowSteps: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={{
          steps: props.steps,
        }}
        onSubmit={async (data: any) => {
          props.onSave(data.steps);
        }}
      >
        {({
          handleSubmit,
          handleChange,
          submitForm,
          values,
          errors,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StepsGraph steps={values.steps} />
              </Grid>
            </Grid>
            <ActionButtons
              submit={{ text: t("Next"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
          </form>
        )}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
  checkboxError: {
    color: theme.palette.error.main,
  },
}));
