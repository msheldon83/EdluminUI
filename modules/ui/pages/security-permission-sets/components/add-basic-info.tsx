import { Grid, InputLabel } from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { Input } from "ui/components/form/input";
import { OrgUserRole } from "graphql/server-types.gen";
import { useMemo } from "react";
import {
  SelectDEPRECATED,
  SelectValueType,
} from "ui/components/form/select-DEPRECATED";
import { OptionTypeBase } from "react-select";

type Props = {
  permissionSet: {
    name: string;
    orgUserRole: OrgUserRole;
    externalId?: string | null | undefined;
    description?: string | null | undefined;
  };
  namePlaceholder: string;
  onSubmit: (
    name: string,
    orgUserRole: OrgUserRole,
    externalId?: string | null | undefined,
    description?: string | null | undefined
  ) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  onRoleChange: (role: OrgUserRole | undefined) => void;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const roleOptions = useMemo(
    () => [
      { value: OrgUserRole.Administrator, label: "Admin" },
      { value: OrgUserRole.Employee, label: "Employee" },
      { value: OrgUserRole.ReplacementEmployee, label: "Substitute" },
    ],
    []
  );

  const validateBasicDetails = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        orgUserRole: Yup.string()
          .nullable()
          .required(t("Role is required")),
        externalId: Yup.string().nullable(),
        description: Yup.string().nullable(),
      }),
    [t]
  );

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={{
          name: props.permissionSet.name,
          orgUserRole:
            props.permissionSet.orgUserRole === OrgUserRole.Invalid
              ? undefined
              : props.permissionSet.orgUserRole,
          externalId: props.permissionSet.externalId || "",
          description: props.permissionSet.description || "",
        }}
        validationSchema={validateBasicDetails}
        onSubmit={async (data: any) => {
          props.onSubmit(
            data.name,
            data.orgUserRole,
            data.externalId,
            data.description
          );
        }}
      >
        {({
          handleSubmit,
          handleChange,
          submitForm,
          values,
          setFieldValue,
          errors,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 4}>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
                  label={t("Permission set name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g ${props.namePlaceholder}`,
                    name: "name",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      props.onNameChange(e.currentTarget.value);
                    },
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
                  label={t("Identifier")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "externalId",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    helperText: t("Usually used for data integrations"),
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3} lg={3}>
                <InputLabel>{t("Role")}</InputLabel>
                <SelectDEPRECATED
                  value={roleOptions.find(
                    (p: any) => p.value === values.orgUserRole
                  )}
                  label=""
                  options={roleOptions}
                  isClearable={false}
                  onChange={(e: SelectValueType) => {
                    //TODO: Once the select component is updated,
                    // can remove the Array checking
                    let selectedValue = null;
                    if (e) {
                      if (Array.isArray(e)) {
                        selectedValue = (e as Array<OptionTypeBase>)[0].value;
                      } else {
                        selectedValue = (e as OptionTypeBase).value;
                      }
                    }
                    setFieldValue("orgUserRole", selectedValue);
                    props.onRoleChange(selectedValue);
                  }}
                  inputStatus={errors.orgUserRole ? "error" : undefined}
                  validationMessage={errors.orgUserRole}
                />
              </Grid>
              <Grid item xs={12} sm={9} lg={9}>
                <Input
                  label={t("Description")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    name: "description",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
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
