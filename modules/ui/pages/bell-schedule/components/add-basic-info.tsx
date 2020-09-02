import {
  FormControlLabel,
  FormHelperText,
  Grid,
  makeStyles,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { Input } from "ui/components/form/input";
import { Select, OptionType } from "ui/components/form/select";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { ScheduleSettings } from "../helpers";

type Props = {
  bellSchedule: {
    name: string;
    externalId?: string | null | undefined;
  };
  scheduleSettings: ScheduleSettings;
  namePlaceholder: string;
  onSubmit: (
    name: string,
    scheduleSettings: ScheduleSettings,
    externalId?: string | null | undefined
  ) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
};

const buildPeriodOptions = () => {
  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const periodOptions = periods.map(p => {
    return { value: p, label: p.toString() };
  });
  return periodOptions;
};

export const AddBasicInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [isBasicSchedule, setIsBasicSchedule] = React.useState(
    props.scheduleSettings.isBasic
  );

  const periodOptions = buildPeriodOptions();

  return (
    <Section borderTopRadius={false}>
      <SectionHeader title={t("Basic info")} />
      <Formik
        initialValues={{
          name: props.bellSchedule.name,
          externalId: props.bellSchedule.externalId || "",
          isBasicSchedule: props.scheduleSettings.isBasic ? 1 : 0,
          periodNumberOfPeriods:
            props.scheduleSettings.periodSettings.numberOfPeriods,
        }}
        onSubmit={(data, meta) => {
          const scheduleSettings = {
            isBasic: data.isBasicSchedule === 1,
            periodSettings: {
              numberOfPeriods: data.periodNumberOfPeriods,
            },
          };
          props.onSubmit(data.name, scheduleSettings, data.externalId);
        }}
        validationSchema={yup.object().shape({
          name: yup
            .string()
            .nullable()
            .required(t("Name is required")),
          externalId: yup.string().nullable(),
        })}
      >
        {({
          handleSubmit,
          handleChange,
          values,
          setFieldValue,
          submitForm,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} lg={6}>
                <Input
                  label={t("Name")}
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
              <Grid item xs={12}>
                <RadioGroup
                  aria-label="isBasicSchedule"
                  name="isBasicSchedule"
                  value={values.isBasicSchedule}
                  onChange={e => {
                    setFieldValue(
                      "isBasicSchedule",
                      e.target.value === "1" ? 1 : 0
                    );
                    setIsBasicSchedule(e.target.value === "1" ? true : false);
                  }}
                  row={false}
                >
                  <FormControlLabel
                    value={1}
                    control={<Radio color="primary" />}
                    label={t("Basic Schedule")}
                    labelPlacement="end"
                  />
                  <FormHelperText className={classes.radioHelperText}>
                    {t("Simple morning, lunch and afternoon")}
                  </FormHelperText>
                  <FormControlLabel
                    value={0}
                    control={<Radio color="primary" />}
                    label={t("Period Schedule")}
                    labelPlacement="end"
                  />
                  <FormHelperText className={classes.radioHelperText}>
                    {t("Specify the complete bell schedule")}
                  </FormHelperText>
                  <div className={classes.periodScheduleSubItems}>
                    <div>{t("Number of periods")}</div>
                    <div className={classes.periodOptions}>
                      <Select
                        value={periodOptions.find(
                          (p: any) => p.value === values.periodNumberOfPeriods
                        )}
                        options={periodOptions}
                        multiple={false}
                        disabled={isBasicSchedule}
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
                          setFieldValue("periodNumberOfPeriods", selectedValue);
                        }}
                        doSort={false}
                      />
                    </div>
                  </div>
                </RadioGroup>
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

const useStyles = makeStyles(theme => ({
  radioHelperText: {
    marginTop: 0,
    marginLeft: theme.spacing(4),
  },
  periodScheduleSubItems: {
    marginTop: theme.spacing(),
    marginLeft: theme.spacing(4),
  },
  periodOptions: {
    marginTop: theme.spacing(),
    width: theme.typography.pxToRem(100),
  },
}));
