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
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { AbsenceBasicInfo } from "./absence-basic-info";
import { VacancyBasicInfo } from "./vacancy-basic-info";

type Props = {
  onCancel: () => void;
  onSave: (name: string, usages: string) => void;
  workflowType: ApprovalWorkflowType;
  orgId: string;
};

export const BasicInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const renderWorkflowTypeBasicInfo = (
    usages: string,
    setFieldValue: Function
  ) => {
    switch (props.workflowType) {
      case ApprovalWorkflowType.Absence:
        return (
          <AbsenceBasicInfo
            usages={usages}
            setFieldValue={setFieldValue}
            orgId={props.orgId}
          />
        );
      case ApprovalWorkflowType.Vacancy:
        return (
          <VacancyBasicInfo
            usages={usages}
            setFieldValue={setFieldValue}
            orgId={props.orgId}
          />
        );
    }
  };

  return (
    <Section>
      <SectionHeader title={t("Name placeholder")} />
      <Formik
        initialValues={{
          name: "",
          usages: "[]",
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .nullable()
            .required(t("Name is required")),
        })}
        onSubmit={async (data: any) => {
          props.onSave(data.name, data.usages);
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
            <Grid container spacing={2} item xs={6}>
              <Grid item xs={6}>
                <Input
                  value={values.name}
                  label={t("Name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "name",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              {renderWorkflowTypeBasicInfo(values.usages, setFieldValue)}
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
