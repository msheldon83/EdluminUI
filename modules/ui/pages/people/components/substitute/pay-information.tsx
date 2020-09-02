import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { OptionType, Select } from "ui/components/form/select";
import { PayCode, PermissionEnum } from "graphql/server-types.gen";

export const editableSections = {
  payInformation: "edit-pay-information",
};

type Props = {
  editing: string | null;
  editable: boolean;
  payCodeOptions: OptionType[];
  onSubmit: (orgUser: any) => Promise<unknown>;
  payCode?: Pick<PayCode, "id" | "name"> | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  onCancel?: () => void;
  editPermissions?: PermissionEnum[];
};

export const SubPayInformation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const payCodeName = props?.payCode?.name ?? t("None Selected");

  return (
    <>
      <Formik
        enableReinitialize
        onSubmit={async (data, e) => {
          await props.onSubmit({
            payCodeId: data.payCodeId,
          });
        }}
        initialValues={{ payCodeId: props.payCode?.id }}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader
                title={t("Pay information")}
                actions={[
                  {
                    text: t("Edit"),
                    visible: !props.editing && props.editable,
                    execute: () => {
                      props.setEditing(editableSections.payInformation);
                    },
                    permissions: props.editPermissions,
                  },
                ]}
                submit={{
                  text: t("Save"),
                  visible: props.editing === editableSections.payInformation,
                  execute: submitForm,
                }}
                cancel={{
                  text: t("Cancel"),
                  visible: props.editing === editableSections.payInformation,
                  execute: () => {
                    props.setEditing(null);
                  },
                }}
              />
              {props.editing === editableSections.payInformation ? (
                <Grid item xs={3}>
                  <div>{t("Pay Code")}</div>
                  <Select
                    value={
                      props.payCodeOptions.find(
                        (p: any) => p.value === values.payCodeId
                      ) ?? { value: "", label: "" }
                    }
                    multiple={false}
                    onChange={(value: OptionType) => {
                      setFieldValue("payCodeId", value.value);
                    }}
                    options={props.payCodeOptions}
                  />
                </Grid>
              ) : (
                <Grid item>
                  <Typography variant="h6">{t("Pay code")}</Typography>
                  <Typography>{payCodeName}</Typography>
                </Grid>
              )}
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};
