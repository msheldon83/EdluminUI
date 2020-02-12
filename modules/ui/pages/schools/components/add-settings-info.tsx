import { Grid, makeStyles } from "@material-ui/core";
import { Formik } from "formik";
import { StateCode } from "graphql/server-types.gen";
import * as yup from "yup";
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

type Props = {
  locationGroupOptions: OptionType[];
  location: {
    address?:
      | {
          address1?: string | undefined | null;
          city?: string | undefined | null;
          state?: StateCode | undefined | null;
          postalCode?: string | undefined | null;
        }
      | undefined
      | null;
    phoneNumber?: string | undefined | null;
    locationGroupId?: string | undefined | null;
  };
  submitText: string;
  onSubmit: (
    locationGroupId: string,
    address1?: string | undefined | null,
    city?: string | undefined | null,
    state?: StateCode | undefined | null,
    postalCode?: string | undefined | null,
    phoneNumber?: string | undefined | null
  ) => Promise<unknown>;
  onCancel: () => void;
};

export const AddSettingsInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const stateOptions = USStates.map(s => ({
    label: s.name,
    value: s.enumValue,
  }));

  const phoneRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

  console.log(props.location);

  return (
    <Section>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={{
          address1: props?.location?.address?.address1 ?? "",
          city: props?.location?.address?.city ?? "",
          state: props.location?.address?.state ?? undefined,
          postalCode: props?.location?.address?.postalCode ?? "",
          phoneNumber: props.location.phoneNumber ?? "",
          locationGroupId: props.location.locationGroupId ?? "",
        }}
        onSubmit={async (data, meta) => {
          await props.onSubmit(
            data.locationGroupId,
            data.address1.trim().length === 0 ? null : data.address1,
            data.city.trim().length === 0 ? null : data.city,
            data.state ?? null,
            data.postalCode.trim().length === 0 ? null : data.postalCode,
            data.phoneNumber.trim().length === 0
              ? null
              : cleanPhoneNumber(data.phoneNumber)
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
                <Grid container item xs={8} component="dl" spacing={2}>
                  <Grid container item xs={6} spacing={2}>
                    <Grid item xs={12}>
                      <dt className={classes.title}>{t("School group")}</dt>
                      <SelectNew
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
                        validationMessage={errors.locationGroupId}
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
                  <Grid container item xs={6} spacing={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <dt className={classes.title}>{t("Street")}</dt>
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
                        <dt className={classes.title}>{t("City")}</dt>
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
                        <SelectNew
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
                          validationMessage={errors.state}
                          multiple={false}
                          options={stateOptions}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <dt className={classes.title}>{t("Zip")}</dt>
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
  },
}));
