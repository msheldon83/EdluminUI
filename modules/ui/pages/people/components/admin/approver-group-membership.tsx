import * as React from "react";
import {
  Typography,
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
  InputLabel,
} from "@material-ui/core";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Formik } from "formik";
import * as yup from "yup";
import { Section } from "ui/components/section";
import { PermissionEnum } from "graphql/server-types.gen";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";

const editableSections = {
  approverGroupMembership: "edit-approver-group-membership",
};

type Props = {
  editing: string | null;
  editable: boolean;
  orgId: string;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmit: (admin: any) => Promise<unknown>;
  onCancel: () => void;
};

export const ApproverGroupMembership: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const editingThis =
    props.editing === editableSections.approverGroupMembership;

  return (
    <>
      <Formik initialValues={{}} onSubmit={async (data, e) => {}}>
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader
                title={t("Access Control")}
                actions={[
                  {
                    text: t("Edit"),
                    visible: !props.editing && props.editable,
                    execute: () => {
                      props.setEditing!(
                        editableSections.approverGroupMembership
                      );
                    },
                    permissions: [PermissionEnum.AdminSave],
                  },
                ]}
                cancel={{
                  text: t("Cancel"),
                  visible: editingThis,
                  execute: () => {
                    props.onCancel();
                  },
                }}
                submit={{
                  text: t("Save"),
                  visible: editingThis,
                  execute: submitForm,
                }}
              />
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
