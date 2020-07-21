import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { ActionButtons } from "ui/components/action-buttons";
import {
  ApprovalWorkflowType,
  ApprovalWorkflowStepInput,
} from "graphql/server-types.gen";
import { StepsGraph } from "../workflow-graph/graph";

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
      <SectionHeader title={t("Workflow steps")} />
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
                <StepsGraph
                  steps={values.steps}
                  orgId={props.orgId}
                  workflowType={props.workflowType}
                />
              </Grid>
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

const useStyles = makeStyles(theme => ({}));
