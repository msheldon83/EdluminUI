import { Grid, makeStyles, TextField } from "@material-ui/core";
import { Formik, ErrorMessage } from "formik";
import { StateCode } from "graphql/server-types.gen";
import * as yup from "yup";
import { useIsMobile } from "hooks";
import * as React from "react";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { useTranslation } from "react-i18next";
import { USStates } from "reference-data/states";
import { OptionTypeBase } from "react-select/src/types";
import { Input } from "ui/components/form/input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { ActionButtons } from "../../../components/action-buttons";
import { phoneRegExp } from "helpers/regexp";

type Props = {
  locationGroupOptions: OptionType[];
  location: {
    address?:
    | {
      address1?: string | undefined | null;
      address2?: string | undefined | null;
      city?: string | undefined | null;
      state?: StateCode | undefined | null;
      postalCode?: string | undefined | null;
    }
    | undefined
    | null;
    phoneNumber?: string | undefined | null;
    locationGroupId?: string | undefined | null;
    notes?: string | undefined | null;
  };
  submitText: string;
  onSubmit: (
    locationGroupId: string,
    address1?: string | undefined | null,
    address2?: string | undefined | null,
    city?: string | undefined | null,
    state?: StateCode | undefined | null,
    postalCode?: string | undefined | null,
    phoneNumber?: string | undefined | null,
    notes?: string | undefined | null
  ) => Promise<unknown>;
  onCancel: () => void;
};

export const AddSettingsInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const textFieldClasses = useTextFieldClasses();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const stateOptions = USStates.map(s => ({
    label: s.name,
    value: s.enumValue,
  }));

  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

  return (
    <Section>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={{
          address1: props?.location?.address?.address1 ?? "",
          address2: props?.location?.address?.address2 ?? "",
          city: props?.location?.address?.city ?? "",
          state: props.location?.address?.state ?? undefined,
          postalCode: props?.location?.address?.postalCode ?? "",
          phoneNumber: props.location.phoneNumber ?? "",
          locationGroupId: props.location.locationGroupId ?? "",
          notes: props.location.notes ?? ""
        }}
        onSubmit={async (data, meta) => {
          await props.onSubmit(
            data.locationGroupId,
            data.address1.trim().length === 0 ? null : data.address1,
            data.address2.trim().length === 0 ? null : data.address2,
            data.city.trim().length === 0 ? null : data.city,
            data.state ?? null,
            data.postalCode.trim().length === 0 ? null : data.postalCode,
            data.phoneNumber.trim().length === 0
              ? null
              : cleanPhoneNumber(data.phoneNumber),
            data.notes ?? null
          );
        }}
        validationSchema={yup.object({
          locationGroupId: yup
            .string()
            .nullable()
            .required(t("School Group is required")),
          phoneNumber: yup
            .string()
            .nullable()
            .matches(phoneRegExp, t("Phone Number Is Not Valid")),
          postalCode: yup
            .number()
            .nullable()
            .min(5)
            .required(t("Zip code is required")),
          address1: yup
            .string()
            .nullable()
            .required(t("Address is required")),
          city: yup
            .string()
            .nullable()
            .required(t("City is required")),
          state: yup
            .string()
            .nullable()
            .required(t("State is required")),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Grid container>
                <Grid container item xs={12} component="dl" spacing={2}>
                  <Grid container item xs={isMobile ? 12 : 4} spacing={2}>
                    <Grid item xs={12}>
                      <dt className={classes.title}>{t("School group")}</dt>
                      <span className={classes.required}>*</span>
                      <SelectNew
                        name="locationGroupId"
                        value={{
                          value: values.locationGroupId ?? "",
                          label:
                            props.locationGroupOptions.find(
                              (c: any) => c.value === values.locationGroupId
                            )?.label || "",
                        }}
                        onChange={(e: OptionType) => {
                          let selectedValue = null;
                          if (e) {
                            if (Array.isArray(e)) {
                              selectedValue = (e as Array<OptionTypeBase>)[0]
                                .value;
                            } else {
                              selectedValue = (e as OptionTypeBase).value;
                            }
                          }
                          setFieldValue("locationGroupId", selectedValue);
                        }}
                        inputStatus={
                          errors.locationGroupId ? "error" : undefined
                        }
                        options={props.locationGroupOptions}
                        multiple={false}
                      />
                    </Grid>
                    <Grid item xs={12} className={classes.marginBottom}>
                      <dt className={classes.title}>{t("Phone number")}</dt>
                      <Input
                        value={values.phoneNumber}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          name: "phoneNumber",
                          id: "phoneNumber",
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item xs={isMobile ? 12 : 4} spacing={2}>
                    <Grid item xs={12}>
                      <dt className={classes.title}>{t("Street")}</dt>
                      <span className={classes.required}>*</span>
                      <Input
                        value={values.address1}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          name: "address1",
                          id: "address1",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <dt className={classes.title}>{t("")}</dt>
                      <Input
                        value={values.address2}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          name: "address2",
                          id: "address2",
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <dt className={classes.title}>{t("City")}</dt>
                      <span className={classes.required}>*</span>
                      <Input
                        value={values.city}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          name: "city",
                          id: "city",
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <dt className={classes.title}>{t("State")}</dt>
                      <span className={classes.required}>*</span>
                      <SelectNew
                        name="state"
                        value={{
                          value: values.state ?? "",
                          label:
                            stateOptions.find(a => a.value === values.state)
                              ?.label || "",
                        }}
                        onChange={(e: OptionType) => {
                          let selectedValue = null;
                          if (e) {
                            if (Array.isArray(e)) {
                              selectedValue = (e as Array<OptionTypeBase>)[0]
                                .value;
                            } else {
                              selectedValue = (e as OptionTypeBase).value;
                            }
                          }
                          setFieldValue("state", selectedValue);
                        }}
                        inputStatus={errors.state ? "error" : undefined}
                        multiple={false}
                        options={stateOptions}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <dt className={classes.title}>{t("Zip")}</dt>
                      <span className={classes.required}>*</span>
                      <Input
                        value={values.postalCode}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          name: "postalCode",
                          id: "postalCode",
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container xs={isMobile ? 12 : 4} item>
                    <Grid item xs={12}>
                      <dt className={classes.title}>{t("Notes")}</dt>
                      <TextField
                        multiline={true}
                        rows="4"
                        value={values.notes}
                        fullWidth={true}
                        variant="outlined"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue("notes", e.target.value);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <ActionButtons
                submit={{ text: props.submitText, execute: submitForm }}
                cancel={{ text: t("Cancel"), execute: props.onCancel }}
              />
            </form>
          );
        }}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  marginBottom: {
    marginBottom: "90px",
  },
  title: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "bold",
    lineHeight: theme.typography.pxToRem(24),
    display: "inline-block",
  },

  required: {
    color: "#C62828",
    marginLeft: theme.typography.pxToRem(5),
  },
}));

const useTextFieldClasses = makeStyles(theme => ({
  multiline: {
    padding: theme.spacing(1),
  },
}));
