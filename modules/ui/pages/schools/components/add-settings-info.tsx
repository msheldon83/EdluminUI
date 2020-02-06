import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import { Formik } from "formik";
import { useQueryBundle } from "graphql/hooks";
import { AddressInput, TimeZone } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { GetTimezones } from "reference-data/get-timezones.gen";
import { DurationInput } from "ui/components/form/duration-input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { GetAllLocationGroupsWithinOrg } from "ui/pages/school-group/graphql/get-all-location-groups.gen";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { useMemo } from "react";

type Props = {
  orgId: string;
  location: {
    timeZoneId?: TimeZone | undefined | null;
    address?: AddressInput | undefined | null;
    phoneNumber?: string | undefined | null;
    locationGroupId?: string | undefined | null;
  };
  submitText: string;
  onSubmit: (
    address: AddressInput | undefined | null,
    phoneNumber: string | undefined | null,
    timeZoneId: TimeZone | undefined | null,
    locationGroupId: string | undefined | null
  ) => Promise<unknown>;
  onCancel: () => void;
};

export const AddSettingsInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  //Query Location Groups
  const locationGroups = useQueryBundle(GetAllLocationGroupsWithinOrg, {
    variables: { orgId: props.orgId },
  });

  if (locationGroups.state === "LOADING") {
    return <></>;
  }

  //

  return (
    <Section>
      <SectionHeader title={t("Settings")} />
      <Formik
        initialValues={{
          timeZoneId: props.location.timeZoneId,
          address: props.location.address,
          phoneNumber: props.location.phoneNumber,
          locationGroupId: props.location.locationGroupId,
        }}
        onSubmit={async (data, meta) => {
          await props.onSubmit(
            data.address,
            data.phoneNumber,
            data.timeZoneId,
            data.locationGroupId
          );
        }}
        validationSchema={yup
          .object()
          .shape({
            minAbsenceDurationMinutes: yup
              .number()
              .required(t("Minimum Absence Duration is required")),
          })
          .test({
            name: "forStaffAugmentationCheck",
            test: value => {
              if (value.forStaffAugmentation || value.forPermanentPositions) {
                return true;
              }

              return new yup.ValidationError(
                "Error",
                null,
                "forStaffAugmentation"
              );
            },
          })
          .test({
            name: "forPermanentPositionsCheck",
            test: value => {
              if (value.forStaffAugmentation || value.forPermanentPositions) {
                return true;
              }

              return new yup.ValidationError(
                "Error",
                null,
                "forPermanentPositions"
              );
            },
          })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Typography variant="h6">
                {t("How will you use this position?")}
              </Typography>
              <div
                className={[
                  classes.contractSection,
                  isMobile
                    ? classes.mobileSectionSpacing
                    : classes.normalSectionSpacing,
                ].join(" ")}
              >
                <div>{t("Default contract")}</div>
                <SelectNew
                  value={locationGroupOptions.find(
                    (c: any) => c.value === values.defaultContractId
                  )}
                  options={locationGroupOptions}
                  onChange={(e: OptionType) => {
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
                    setFieldValue("locationGroupId", selectedValue);
                  }}
                  multiple={false}
                />
                <FormHelperText>
                  {t(
                    "Positions of this type will likely be associated with this contract"
                  )}
                </FormHelperText>
              </div>
              <div
                className={[
                  classes.minAbsenceSection,
                  isMobile
                    ? classes.mobileSectionSpacing
                    : classes.normalSectionSpacing,
                ].join(" ")}
              >
                <Typography variant="h6">
                  {t("How should the system behave for this position?")}
                </Typography>
                <FormHelperText>
                  {t(
                    "Don’t worry, you will be able to change these settings for an individual employee"
                  )}
                </FormHelperText>
                <div className={classes.minAbsenceDurationLabel}>
                  <DurationInput
                    label={t("Minimum absence duration")}
                    name="minAbsenceDurationMinutes"
                    value={values.minAbsenceDurationMinutes.toString()}
                    onChange={(value: number) =>
                      setFieldValue("minAbsenceDurationMinutes", value)
                    }
                    inputStatus={
                      errors.minAbsenceDurationMinutes ? "error" : "default"
                    }
                    validationMessage={errors.minAbsenceDurationMinutes}
                    helperMessage={t(
                      "The shortest time (hh:mm) that an employee with this position can be absent."
                    )}
                  />
                </div>
              </div>
              <div
                className={[
                  classes.payTypeSection,
                  isMobile
                    ? classes.mobileSectionSpacing
                    : classes.normalSectionSpacing,
                ].join(" ")}
              >
                <div>{t("Pay Type")}</div>
                <SelectNew
                  value={payTypeOptions.find(
                    (c: any) => c.value === values.payTypeId
                  )}
                  options={payTypeOptions}
                  multiple={false}
                  onChange={(e: OptionType) => {
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
                    setFieldValue("payTypeId", selectedValue);
                  }}
                />
              </div>
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
  contractSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceDurationLabel: {
    marginTop: theme.spacing(2),
  },
  checkboxError: {
    color: theme.palette.error.main,
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
