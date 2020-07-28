import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Button } from "@material-ui/core";
import { Formik } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { ActionButtons } from "ui/components/action-buttons";
import {
  ApprovalWorkflowType,
  ApprovalWorkflowStepInput,
} from "graphql/server-types.gen";
import { StepsGraph } from "../workflow-graph/graph";
import { TestHeader } from "../test-header";

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

  const [stepsDirty, setStepsDirty] = useState(false);
  const [showTestHeader, setShowTestHeader] = useState(false);
  const [testReasonId, setTestReasonId] = useState<string | undefined>(
    undefined
  );

  return (
    <Section>
      <div className={classes.header}>
        <SectionHeader title={t("Workflow steps")} />
        <TestHeader
          open={showTestHeader}
          orgId={props.orgId}
          workflowType={props.workflowType}
          onClose={() => {
            setShowTestHeader(false);
            setTestReasonId(undefined);
          }}
          reasonId={testReasonId}
          setReasonId={setTestReasonId}
        />
      </div>
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
                  testReasonId={testReasonId}
                  setStepsDirty={setStepsDirty}
                />
              </Grid>
            </Grid>
            <ActionButtons
              submit={{
                text: t("Save"),
                execute: submitForm,
                disabled: !stepsDirty,
              }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
              additionalActions={[
                {
                  text: showTestHeader ? t("Hide test") : t("Test"),
                  execute: () => {
                    setShowTestHeader(!showTestHeader);
                    setTestReasonId(undefined);
                  },
                },
              ]}
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
}));
