import * as React from "react";
import { useState } from "react";
import {
  ApprovalWorkflowCreateInput,
  ApprovalWorkflowType,
  ApprovalWorkflowStepInput,
} from "graphql/server-types.gen";
import { useMutationBundle } from "graphql/hooks";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { CreateApprovalWorkflow } from "../../graphql/create-workflow.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  VacancyApprovalWorkflowRoute,
  AbsenceApprovalWorkflowRoute,
} from "ui/routes/approval-workflow";
import { useHistory } from "react-router";
import { BasicInfo, editableSections } from "./basic-info";
import { initialSteps } from "../workflow-graph/types";
import { WorkflowSteps } from "./workflow-steps";
import { Section } from "ui/components/section";
import { cloneDeep } from "lodash-es";

type Props = {
  workflowType: ApprovalWorkflowType;
  orgId: string;
};

export const ApprovalWorkflowAdd: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();

  const [workflow, setWorkflow] = useState<ApprovalWorkflowCreateInput>({
    orgId: props.orgId,
    name: "",
    approvalWorkflowTypeId: props.workflowType,
    steps: cloneDeep(initialSteps),
  });

  const [createApprovalWorkflow] = useMutationBundle(CreateApprovalWorkflow, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleCancel = () => {
    switch (props.workflowType) {
      case ApprovalWorkflowType.Absence:
        history.push(
          AbsenceApprovalWorkflowRoute.generate({ organizationId: props.orgId })
        );
        break;
      case ApprovalWorkflowType.Vacancy:
        history.push(
          VacancyApprovalWorkflowRoute.generate({ organizationId: props.orgId })
        );
        break;
    }
  };

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <Section>
        <BasicInfo
          orgId={props.orgId}
          workflowType={props.workflowType}
          name={""}
          usages={"[]"}
          editName={true}
          saveLabel={t("Next")}
          editing={editableSections.usageInfo}
          editable={false}
          onCancel={handleCancel}
          onSave={(usages: string, name?: string) => {
            setWorkflow({
              ...workflow,
              name: name ?? "",
              usages: usages,
            });
            setStep(steps[1].stepNumber);
          }}
        />
      </Section>
    );
  };

  const renderWorkflow = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <WorkflowSteps
        workflowType={props.workflowType}
        onCancel={handleCancel}
        orgId={props.orgId}
        steps={workflow.steps}
        onSave={async (steps: ApprovalWorkflowStepInput[]) => {
          const result = await create({
            ...workflow,
            steps: steps,
          });
          if (result) {
            handleCancel();
          }
        }}
      />
    );
  };

  const create = async (approvalWorkflow: ApprovalWorkflowCreateInput) => {
    const result = await createApprovalWorkflow({
      variables: {
        approvalWorkflow: approvalWorkflow,
      },
    });
    return result?.data?.approvalWorkflow?.create;
  };

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
      content: renderBasicInfoStep,
    },
    {
      stepNumber: 1,
      name: t("Workflow steps"),
      content: renderWorkflow,
    },
  ];
  const [initialStepNumber, setInitialStepNumber] = React.useState(
    steps[0].stepNumber
  );

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("New workflow")} />
      </div>
      <Tabs
        steps={steps}
        isWizard={true}
        showStepNumber={true}
        initialStepNumber={initialStepNumber}
      ></Tabs>
    </>
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
}));
