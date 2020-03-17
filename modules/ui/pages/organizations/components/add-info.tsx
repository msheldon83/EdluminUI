import {
  Grid,
  makeStyles,
  FormHelperText,
  Checkbox,
  Radio,
  RadioGroup,
} from "@material-ui/core";
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
import {
  OrganizationType,
  TimeZone,
  FeatureFlag,
  CountryCode,
  DayConversion,
  SeedOrgDataOptionEnum,
} from "graphql/server-types.gen";

type Props = {
  namePlaceholder: string;
  onSubmit: (name: string, externalId?: string | null | undefined) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  organization: {
    name: string;
    superUserFirstName: string;
    superUserLastName: string;
    superUserLoginEmail: string;
    seedOrgDataOption?: SeedOrgDataOptionEnum | null;
    config?: {
      organizationTypeId?: OrganizationType;
      orgUsersMustAcceptEula?: boolean;
      featureFlags?: FeatureFlag;
      longTermVacancyThresholdDays?: number;
      defaultCountry?: CountryCode;
      minLeadTimeMinutesToCancelVacancy?: number;
      minutesBeforeStartAbsenceCanBeCreated?: number;
      minLeadTimeMinutesToCancelVacancyWithoutPunishment?: number;
      maxGapMinutesForSameVacancyDetail?: number;
      minAbsenceMinutes?: number;
      maxAbsenceDays?: number;
      absenceCreateCutoffTime?: number;
      requestedSubCutoffMinutes?: number;
      minRequestedEmployeeHoldMinutes?: number;
      maxRequestedEmployeeHoldMinutes?: number;
      minorConflictThresholdMinutes?: number;
      minutesRelativeToStartVacancyCanBeFilled?: number;
      vacancyDayConversions?: DayConversion;
    };
    externalId?: string;
    timeZone?: TimeZone;
  };
};

export const AddBasicInfo: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const classes = useStyles();
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
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
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
              <Grid item xs={12} sm={6} lg={6} className={classes.padding}>
                <Input
                  label={t("Organization name")}
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
              <Grid item xs={12} sm={6} lg={6} className={classes.padding}>
                <Input
                  label={t("External ID")}
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
              <div>
                <Input
                  label={t("Super user first name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g ${props.namePlaceholder}`,
                    name: "superUserFirstName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      props.onNameChange(e.currentTarget.value);
                    },
                    fullWidth: true,
                  }}
                />

                <Input
                  label={t("Super user last name")}
                  InputComponent={FormTextField}
                  inputComponentProps={{
                    placeholder: `E.g ${props.namePlaceholder}`,
                    name: "superUserLastName",
                    margin: isMobile ? "normal" : "none",
                    variant: "outlined",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      handleChange(e);
                      props.onNameChange(e.currentTarget.value);
                    },
                    fullWidth: true,
                  }}
                />
              </div>
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
  padding: {
    padding: theme.spacing(0),
  },
}));
