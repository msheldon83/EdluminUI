import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Button } from "@material-ui/core";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { PageTitle } from "ui/components/page-title";
import { PageHeader } from "ui/components/page-header";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { useState } from "react";
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

type Props = {};

export const ApprovalWorkflowEdit: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(ApprovalWorkflowEditRoute);
  const { openSnackbar } = useSnackbar();
  const history = useHistory();

  const [editing, setEditing] = useState(false);

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

  if (!approvalWorkflow) {
    return <></>;
  }

  return (
    <>
      <div className={classes.header}>
        <PageHeader
          text={approvalWorkflow.name}
          label={t("Name")}
          editable={!editing}
          onEdit={() => setEditing(true)}
          editPermissions={[PermissionEnum.ApprovalSettingsSave]}
          validationSchema={yup.object().shape({
            value: yup.string().required(t("Name is required")),
          })}
          onSubmit={async (value?: Maybe<string>) => {
            await handleUpdateName(value!);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
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
        <StepsGraph
          steps={approvalWorkflow.steps ?? []}
          orgId={params.organizationId}
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
          <Grid item>
            <Button variant="contained" onClick={() => {}}>
              {t("Save")}
            </Button>
          </Grid>
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
}));
