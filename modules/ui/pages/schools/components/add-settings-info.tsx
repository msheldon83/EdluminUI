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
import { AddressInput, TimeZone, Maybe } from "graphql/server-types.gen";
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
    address?: AddressInput | undefined | null;
    phoneNumber?: string | undefined | null;
    locationGroupId?: string | undefined | null;
  };
  submitText: string;
  onSubmit: (
    address: AddressInput | undefined | null,
    phoneNumber: string | undefined | null,   
    locationGroupId: string | undefined | null
  ) => Promise<unknown>;
  onCancel: () => void;
};

export const AddSettingsInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

 

  return (
    <Section>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={{        
          address1: props.location.address,
          city: "",
          state: undefined,
          postalCode: "",
          phoneNumber: props.location.phoneNumber,
          locationGroupId: props.location.locationGroupId,
        }}
        onSubmit={async (data, meta) => {
          await props.onSubmit(
            data.address1,
            data.phoneNumber,        
            data.locationGroupId
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
                        // onChange={(e: OptionType) => {
                        //   let selectedValue = null;
                        //   if (e) {
                        //     if (Array.isArray(e)) {
                        //       selectedValue = (e as Array<OptionTypeBase>)[0]
                        //         .value;
                        //     } else {
                        //       selectedValue = (e as OptionTypeBase).value;
                        //     }
                        //   }
                        //   setFieldValue("locationGroupId", selectedValue);
                        // }}
                        multiple={false}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} lg={12}>
                      <dt className={classes.title}>{t("Phone number")}</dt>
                      
                    </Grid>
                    <Grid item xs={12}>
                      <div>{t("Phone number")}</div>
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
                              stateOptions.find(a => a.value === values.state)
                                ?.label || "",
                          }}
                          multiple={false}
                          onChange={(e: OptionType) => {
                            //TODO: Once the select component is updated,
                            // can remove the Array checking
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
                          options={stateOptions}
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

                    <Grid container item xs={6} spacing={2}></Grid>
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
  useForEmployeesSubItems: {
    marginLeft: theme.spacing(4),
  },
  field: {
    display: "flex",
    width: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  needSubLabel: {
    marginTop: theme.spacing(2),
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
