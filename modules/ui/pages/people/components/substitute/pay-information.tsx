import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { PayCode, PermissionEnum } from "graphql/server-types.gen";
import { OptionTypeBase } from "react-select/src/types";

export const editableSections = {
  payInformation: "edit-pay-information",
};

type Props = {
  editing: string | null;
  editable: boolean;
  payCodeOptions: OptionType[];
  payCode?: Pick<PayCode, "id" | "name"> | null;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmit?: (orgUser: any) => Promise<unknown>;
  onCancel?: () => void;
  editPermissions?: PermissionEnum[];
};

export const SubPayInformation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const payCodeName = props?.payCode?.name ?? t("None Selected");

  return (
    <>
      <Formik
        onSubmit={async (data, e) => {
          await props.onSubmit!({
            payCodeId: data.payCodeId === "" ? null : data.payCodeId,
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
                      props.setEditing!(editableSections.payInformation);
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
                    props.setEditing!(null);
                  },
                }}
              />
              {props.editing === editableSections.payInformation ? (
                <Grid item xs={3}>
                  <div>{t("Pay Code")}</div>
                  <SelectNew
                    value={
                      props.payCodeOptions.find(
                        (p: any) => p.value === values.payCodeId
                      ) ?? { value: "", label: "" }
                    }
                    multiple={false}
                    onChange={(e: OptionType) => {
                      let selectedValue = null;
                      if (e) {
                        if (Array.isArray(e)) {
                          selectedValue = (e as Array<OptionTypeBase>)[0].value;
                        } else {
                          selectedValue = (e as OptionTypeBase).value;
                        }
                      }
                      setFieldValue("payCodeId", selectedValue);
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

export const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "bold",
    letterSpacing: theme.typography.pxToRem(0.15),
    color: theme.customColors.blue,
  },
}));
