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
import { exampleSteps } from "./types";
import { StepsGraph } from "./components/graph";
import { ApprovalWorkflowEditRoute } from "ui/routes/approval-workflow";
import { useRouteParams } from "ui/routes/definition";

type Props = {};

export const ApprovalWorkflowEdit: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(ApprovalWorkflowEditRoute);

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StepsGraph steps={exampleSteps} orgId={params.organizationId} />
        </Grid>
      </Grid>
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
