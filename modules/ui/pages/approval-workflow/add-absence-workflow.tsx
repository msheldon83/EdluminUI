import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import {
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import {
  ApprovalWorkflowCreateInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";
import { CreateApprovalWorkflow } from "./graphql/create-workflow.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  AbsenceApprovalWorkflowAddRoute,
  AbsenceApprovalWorkflowRoute,
} from "ui/routes/approval-workflow";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import {
  buildAbsenceUsagesJsonString,
  exampleSteps,
  buildStepsJsonString,
} from "./types";

export const AbsenceApprovalWorkflowAdd: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(AbsenceApprovalWorkflowAddRoute);
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const [name, setName] = React.useState<string | null>(null);

  const [createApprovalWorkflow] = useMutationBundle(CreateApprovalWorkflow, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const create = async (approvalWorkflow: ApprovalWorkflowCreateInput) => {
    const result = await createApprovalWorkflow({
      variables: {
        approvalWorkflow: approvalWorkflow,
      },
    });
    return result?.data?.approvalWorkflow?.create;
  };

  const initialValues = {
    name: "",
    externalId: undefined,
    variesByLocation: false,
    positionTypeIds: undefined,
    employeeIds: undefined,
  };

  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
      }),
    [t]
  );

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("New workflow")} />
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validateBasicDetails}
        onSubmit={async (data: any) => {
          const newAbsenceApprovalWorkflow: ApprovalWorkflowCreateInput = {
            name: data.name,
            approvalWorkflowTypeId: ApprovalWorkflowType.Absence,
            orgId: params.organizationId,
            usages: buildAbsenceUsagesJsonString(
              data.positionTypeIds,
              data.employeeIds
            ),
            steps: exampleSteps,
          };

          const result = await create(newAbsenceApprovalWorkflow);
          if (!result) return;
          history.push(
            AbsenceApprovalWorkflowRoute.generate({
              organizationId: params.organizationId,
            })
          );
        }}
      >
        {({
          handleSubmit,
          handleChange,
          submitForm,
          setFieldValue,
          values,
          errors,
        }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader title={t("Basic info")} />
              <Grid container spacing={2} item xs={isMobile ? 12 : 6}>
                <Grid item xs={8}>
                  <Input
                    label={t("Name")}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "name",
                      margin: isMobile ? "normal" : "none",
                      variant: "outlined",
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                      },
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={8}>
                  <PositionTypeSelect
                    orgId={params.organizationId}
                    includeAllOption={false}
                    label={t("Position types")}
                    selectedPositionTypeIds={values.positionTypeIds}
                    setSelectedPositionTypeIds={(positionTypeIds?: string[]) =>
                      setFieldValue("positionTypeIds", positionTypeIds)
                    }
                    disabled={values.positionTypeIds === undefined}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.positionTypeIds === undefined}
                        onChange={e => {
                          if (e.target.checked)
                            setFieldValue("positionTypeIds", undefined);
                          else setFieldValue("positionTypeIds", []);
                        }}
                        value={values.positionTypeIds === undefined}
                        color="primary"
                      />
                    }
                    label={t("All non-specified")}
                  />
                </Grid>
              </Grid>
              <ActionButtons
                submit={{ text: t("Save"), execute: submitForm }}
                cancel={{
                  text: t("Cancel"),
                  execute: () => {
                    const url = AbsenceApprovalWorkflowRoute.generate(params);
                    history.push(url);
                  },
                }}
              />
            </Section>
          </form>
        )}
      </Formik>
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
  checkboxError: {
    color: theme.palette.error.main,
  },
}));
