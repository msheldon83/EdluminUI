import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Button, Typography } from "@material-ui/core";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { PageTitle } from "ui/components/page-title";
import { PageHeader } from "ui/components/page-header";
import { Section } from "ui/components/section";
import { useState, useEffect } from "react";
import {
  ApprovalWorkflowType,
  ApprovalWorkflowStepInput,
  PermissionEnum,
  Maybe,
} from "graphql/server-types.gen";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { StepsGraph } from "./components/workflow-graph/graph";
import {
  ApprovalWorkflowEditRoute,
  AbsenceApprovalWorkflowRoute,
  VacancyApprovalWorkflowRoute,
} from "ui/routes/approval-workflow";
import { useRouteParams } from "ui/routes/definition";
import { GetApprovalWorkflowById } from "./graphql/get-approval-workflow-by-id.gen";
import { DeleteApprovalWorkflow } from "./graphql/delete-approval-workflow.gen";
import { UpdateApprovalWorkflow } from "./graphql/update-workflow.gen";
import * as yup from "yup";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useHistory } from "react-router";
import { Can } from "ui/components/auth/can";
import { BasicInfo } from "./components/create/basic-info";
import { compact } from "lodash-es";
import { WorkflowReturnLink } from "./components/return-link";
import { buildCleanStepInput } from "./types";

type Props = {};

const editableSections = {
  name: "edit-name",
};

export const ApprovalWorkflowEdit: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(ApprovalWorkflowEditRoute);
  const { openSnackbar } = useSnackbar();
  const history = useHistory();

  const [editing, setEditing] = useState<string | null>(null);
  const [steps, setSteps] = useState<ApprovalWorkflowStepInput[]>([]);

  const [deleteApprovalWorkflow] = useMutationBundle(DeleteApprovalWorkflow, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateApprovalWorkflow] = useMutationBundle(UpdateApprovalWorkflow, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleDelete = async () => {
    const result = await deleteApprovalWorkflow({
      variables: {
        approvalWorkflowId: params.approvalWorkflowId,
      },
    });
    if (result.data) {
      switch (approvalWorkflow?.approvalWorkflowTypeId) {
        case ApprovalWorkflowType.Absence:
          history.push(
            AbsenceApprovalWorkflowRoute.generate({
              organizationId: params.organizationId,
            })
          );
          break;
        case ApprovalWorkflowType.Vacancy:
          history.push(
            VacancyApprovalWorkflowRoute.generate({
              organizationId: params.organizationId,
            })
          );
          break;
      }
    }
  };

  const getApprovalWorkflowById = useQueryBundle(GetApprovalWorkflowById, {
    variables: {
      id: params.approvalWorkflowId,
    },
  });

  const approvalWorkflow =
    getApprovalWorkflowById.state === "DONE"
      ? getApprovalWorkflowById.data.approvalWorkflow?.byId
      : undefined;

  useEffect(() => {
    if (approvalWorkflow) setSteps(buildCleanStepInput(approvalWorkflow.steps));
  }, [approvalWorkflow, setSteps]);

  const handleUpdateName = async (name: string) => {
    await updateApprovalWorkflow({
      variables: {
        approvalWorkflow: {
          approvalWorkflowId: params.approvalWorkflowId,
          rowVersion: approvalWorkflow?.rowVersion ?? "",
          name: name,
        },
      },
    });
  };

  const handleUpdateUsages = async (usages: string) => {
    await updateApprovalWorkflow({
      variables: {
        approvalWorkflow: {
          approvalWorkflowId: params.approvalWorkflowId,
          rowVersion: approvalWorkflow?.rowVersion ?? "",
          usages: usages,
        },
      },
    });
  };

  const handleUpdateSteps = async () => {
    await updateApprovalWorkflow({
      variables: {
        approvalWorkflow: {
          approvalWorkflowId: params.approvalWorkflowId,
          rowVersion: approvalWorkflow?.rowVersion ?? "",
          steps: steps,
        },
      },
    });
  };

  if (!approvalWorkflow) {
    return <></>;
  }

  return (
    <>
      <div className={classes.header}>
        <div className={classes.link}>
          <WorkflowReturnLink
            orgId={params.organizationId}
            type={approvalWorkflow.approvalWorkflowTypeId}
          />
        </div>
        <PageHeader
          text={approvalWorkflow.name}
          label={t("Name")}
          editable={editing === null}
          onEdit={() => setEditing(editableSections.name)}
          editPermissions={[PermissionEnum.ApprovalSettingsSave]}
          validationSchema={yup.object().shape({
            value: yup.string().required(t("Name is required")),
          })}
          onSubmit={async (value?: Maybe<string>) => {
            await handleUpdateName(value!);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
          actions={[
            {
              name: t("Delete"),
              onClick: handleDelete,
              permissions: [PermissionEnum.ApprovalSettingsSave],
            },
          ]}
        />
      </div>
      <Section>
        <div className={classes.infoWrapper}>
          <BasicInfo
            orgId={params.organizationId}
            workflowType={approvalWorkflow.approvalWorkflowTypeId}
            usages={JSON.stringify(approvalWorkflow.usages)}
            editing={editing}
            setEditing={setEditing}
            editable={editing !== "usage-info"}
            onSave={handleUpdateUsages}
            onCancel={() => setEditing(null)}
            editName={false}
            name={approvalWorkflow.name}
            saveLabel={t("Save")}
            approvalWorkflowId={params.approvalWorkflowId}
          />
        </div>
        <StepsGraph
          steps={steps}
          setSteps={setSteps}
          orgId={params.organizationId}
          workflowType={approvalWorkflow.approvalWorkflowTypeId}
        />
        <Grid
          container
          justify="flex-end"
          spacing={2}
          className={classes.buttonContainer}
        >
          {/*
          <Grid item>
            <Button variant="outlined" onClick={() => {}}>
              {t("Test")}
            </Button>
          </Grid>
          */}
          <Can do={[PermissionEnum.ApprovalSettingsSave]}>
            <Grid item>
              <Button variant="contained" onClick={() => handleUpdateSteps()}>
                {t("Save")}
              </Button>
            </Grid>
          </Can>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
  },
  link: {
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
  },
  infoWrapper: {
    paddingBottom: theme.spacing(2),
  },
}));
