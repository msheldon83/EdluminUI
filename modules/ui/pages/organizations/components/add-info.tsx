import {
  Grid,
  makeStyles,
  FormHelperText,
  Checkbox,
  Divider,
  Radio,
  MenuItem,
  RadioGroup,
} from "@material-ui/core";
import { Formik } from "formik";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { GetTimezones } from "reference-data/get-timezones.gen";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { OptionTypeBase } from "react-select/src/types";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import * as Forms from "atomic-object/forms";
import { ActionButtons } from "../../../components/action-buttons";
import { Input } from "ui/components/form/input";
import { OrganizationCreateInput, Maybe } from "graphql/server-types.gen";

type Props = {
  namePlaceholder: string;
  onSubmit: (name: string, externalId?: string | null | undefined) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  seedOrgDataOptions: OptionType[];
  timeZoneOptions: OptionType[];
  organizationTypes: OptionType[];
  featureFlagOptions: OptionType[];
  organization: OrganizationCreateInput;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const classes = useStyles();
  const overrideStyles = rootStyles();
  const { t } = useTranslation();

  const initialValues = {
    name: props.organization.name,
    externalId: props.organization.externalId || "",
    superUserFirstName: props.organization.superUserFirstName || "",
    superUserLastName: props.organization.superUserLastName || "",
  };

  //Add more validation
  const validateBasicDetails = React.useMemo(
    () =>
      Yup.object().shape({
        orgName: Yup.string()
          .nullable()
          .required(t("Organization name is required")),
        externalId: Yup.string().nullable(),
        superUserFirstName: Yup.string()
          .nullable()
          .required(t("First name is required")),
        superUserLastName: Yup.string()
          .nullable()
          .required(t("Last name is required")),
        superUserLoginEmail: Yup.string()
          .nullable()
          .required(t("email is required")),
      }),
    [t]
  );

  return (
    <Section>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={initialValues}
        validationSchema={validateBasicDetails}
        onSubmit={async (data: any) => {
          props.onSubmit(data.name, data.externalId);
        }}
      >
        {({ handleSubmit, handleChange, submitForm, values }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={isMobile ? 2 : 8}>
              <Grid
                item
                xs={12}
                sm={6}
                lg={6}
                classes={{ root: overrideStyles.root }}
              >
                <Input
                  label={t("Organization name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g ${props.namePlaceholder}`,
                    name: "orgName",
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
              <Grid
                item
                xs={12}
                sm={6}
                lg={6}
                classes={{ root: overrideStyles.root }}
              >
                <SelectNew
                  label={t("Time Zone")}
                  name={"timeZoneId"}
                  options={props.timeZoneOptions}
                  withResetValue={false}
                  multiple={false}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                lg={3}
                classes={{ root: overrideStyles.root }}
              >
                <Input
                  label={t("External Id")}
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
              <Grid
                item
                xs={12}
                sm={3}
                lg={3}
                classes={{ root: overrideStyles.root }}
              >
                <Input
                  label={t("Super User First Name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g John`,
                    name: "superUserFirstName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                lg={3}
                classes={{ root: overrideStyles.root }}
              >
                <Input
                  label={t("Super User Last Name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g Smith`,
                    name: "superUserLastName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                lg={3}
                classes={{ root: overrideStyles.root }}
              >
                <Input
                  label={t("Super User Email")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g johnsmith@fake.com`,
                    name: "superUserLoginEmail",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    fullWidth: true,
                  }}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                lg={3}
                classes={{ root: overrideStyles.root }}
              >
                <SelectNew
                  label={t("Seed Data Option")}
                  name={"seedOrgDataOption"}
                  withResetValue={false}
                  options={props.seedOrgDataOptions}
                  multiple={false}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                lg={3}
                classes={{ root: overrideStyles.root }}
              >
                <SelectNew
                  label={t("Feature Flags")}
                  name={"featureFlags"}
                  withResetValue={false}
                  options={props.featureFlagOptions}
                  //TODO: Not working.
                  multiple={true}
                />
              </Grid>
            </Grid>

            <ActionButtons
              submit={{ text: t("Save"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
          </form>
        )}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  paddingTop: {
    paddingTop: theme.spacing(4),
  },
}));

const rootStyles = makeStyles(theme => ({
  root: {
    padding: `20px 32px 0px 32px !important`,
  },
}));
