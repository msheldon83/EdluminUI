import {
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { Formik } from "formik";
import { useQueryBundle } from "graphql/hooks";
import {
  AddressInput,
  TimeZone,
  Maybe,
  CountryCode,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { TextButton } from "ui/components/text-button";
import TextField from "@material-ui/core/TextField";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { Input } from "ui/components/form/input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { ActionButtons } from "../../../components/action-buttons";
import { useMemo } from "react";

type Props = {
  locationGroupOptions: OptionType[];
  stateOptions: OptionType[];
  location: {
    address: {
      address1?: string | undefined | null;
      city?: string | undefined | null;
      state?: string | undefined | null;
      postalCode?: string | undefined | null;
      country?: CountryCode | undefined | null;
    };
    phoneNumber?: string | undefined | null;
    locationGroupId: string;
  };
  submitText: string;
  onSubmit: (
    locationGroupId: string,
    address1?: string | undefined | null,
    city?: string | undefined | null,
    state?: string | undefined | null,
    postalCode?: string | undefined | null,
    country?: CountryCode | undefined | null,
    phoneNumber?: string | undefined | null
  ) => Promise<unknown>;
  onCancel: () => void;
};

export const AddSettingsInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  //add validation for LocaitonId

  return (
    <Section>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={{
          address1: props.location.address.address1,
          country: props.location.address.country,
          city: props.location.address.city,
          state: props.location.address.state,
          postalCode: props.location.address.postalCode,
          phoneNumber: props.location.phoneNumber,
          locationGroupId: props.location.locationGroupId,
        }}
        onSubmit={async (data, meta) => {
          await props.onSubmit(
            data.country,
            data.locationGroupId,
            data.address1,
            data.city,
            data.state,
            data.postalCode,
            data.phoneNumber
          );
        }}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Grid container>
                <Grid container item xs={8} component="dl" spacing={2}>
                  <Grid container item xs={6} spacing={2}>
                    <Grid item xs={12} sm={12} lg={12}>
                      <dt className={classes.title}>{t("School group")}</dt>
                      <SelectNew
                        value={props.locationGroupOptions.find(
                          (c: any) => c.value === values.locationGroupId
                        )}
                        options={props.locationGroupOptions}
                        multiple={false}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} lg={12}>
                      <dt className={classes.title}>{t("Phone number")}</dt>
                      <Input
                        value={values.phoneNumber}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          name: "phonenumber",
                          id: "phonenumber",
                        }}
                      />
                    </Grid>
                    <Grid container item xs={6} spacing={2}></Grid>
                  </Grid>
                  <Grid container item xs={6} spacing={2}>
                    <Grid item xs={12} sm={12} lg={12}></Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <div>{t("Street")}</div>
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
                        <div>{t("City")}</div>
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
                        <div>{t("State")}</div>
                        <SelectNew
                          value={{
                            value: values.state ?? "",
                            label:
                              props.stateOptions.find(
                                a => a.value === values.state
                              )?.label || "",
                          }}
                          multiple={false}
                          options={props.stateOptions}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <div>{t("Zip")}</div>
                        <Input
                          value={values.postalCode}
                          InputComponent={FormTextField}
                          inputComponentProps={{
                            name: "postalCode",
                            id: "postalCode",
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextButton
                          onClick={() => {
                            setFieldValue("address1", "");
                            setFieldValue("city", "");
                            setFieldValue("postalCode", "");
                            setFieldValue("state", null);
                          }}
                        >
                          {t("Clear address")}
                        </TextButton>
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
  field: {
    display: "flex",
    width: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  mobileSectionSpacing: {
    marginTop: theme.spacing(2),
  },
  formHelperText: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  normalSectionSpacing: {
    marginTop: theme.spacing(6),
  },
  minAbsenceSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  filled: {
    background: theme.customColors.grayWhite,
  },
  minAbsenceDurationLabel: {
    marginTop: theme.spacing(2),
  },
  checkboxError: {
    color: theme.palette.error.main,
  },
  description: {
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(21),
    margin: 0,
  },
  title: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "bold",
    lineHeight: theme.typography.pxToRem(24),
  },
  appliesToError: {
    marginTop: theme.spacing(2),
    fontSize: theme.typography.pxToRem(14),
  },
  payTypeSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
}));
