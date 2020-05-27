import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import * as Yup from "yup";
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { AbsenceBasicInfo } from "./absence-basic-info";
import { VacancyBasicInfo } from "./vacancy-basic-info";

export const editableSections = {
  usageInfo: "usage-info",
};

type Props = {
  onCancel: () => void;
  onSave: (usages: string, name?: string) => void;
  workflowType: ApprovalWorkflowType;
  orgId: string;
  editable: boolean;
  editing: string | null;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  editName: boolean;
  name: string;
  usages: string;
  saveLabel: string;
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
            editing={props.editing === editableSections.usageInfo}
            setEditing={props.setEditing}
            editable={props.editable}
          />
        );
      case ApprovalWorkflowType.Vacancy:
        return (
          <VacancyBasicInfo
            usages={usages}
            setFieldValue={setFieldValue}
            orgId={props.orgId}
            editing={props.editing === editableSections.usageInfo}
            setEditing={props.setEditing}
            editable={props.editable}
          />
        );
    }
  };

  return (
    <Formik
      initialValues={{
        name: props.name,
        usages: props.usages,
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
      })}
      onSubmit={async (data: any) => {
        props.onSave(data.usages, data.name);
        if (props.setEditing) {
          props.setEditing(null);
        }
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
            {props.editName && (
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
            )}
            {renderWorkflowTypeBasicInfo(values.usages, setFieldValue)}
          </Grid>
          {props.editing === editableSections.usageInfo && (
            <ActionButtons
              submit={{ text: props.saveLabel, execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
          )}
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({}));
