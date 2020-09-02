import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Grid, InputLabel, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import {
  UserUnavailableTimeInput,
  UserAvailability,
} from "graphql/server-types.gen";
import * as yup from "yup";
import { Formik } from "formik";
import { OptionType, Select } from "ui/components/form/select";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { secondsSinceMidnight } from "helpers/time";
import { DatePicker } from "ui/components/form/date-picker";
import { isBefore, addDays } from "date-fns";
import { isAfterDate } from "helpers/date";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { useIsMobile } from "hooks";

type Props = {
  userId: string;
  onSave: (exception: UserUnavailableTimeInput) => Promise<unknown>;
  fromDate?: Date;
  toDate?: Date;
};

export const AddException: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();
  const today = useMemo(() => new Date(), []);

  const availabilityOptions = [
    { label: t("Available before"), value: UserAvailability.Before },
    { label: t("Available after"), value: UserAvailability.After },
    { label: t("Not available"), value: UserAvailability.NotAvailable },
  ];

  return (
    <>
      <Section className={classes.section}>
        <SectionHeader title={t("Add non-recurring event")} />
        <Formik
          initialValues={{
            availability: UserAvailability.NotAvailable,
            time: undefined,
            fromDate: props.fromDate ?? today,
            toDate: props.toDate ?? today,
            reason: "",
          }}
          onSubmit={async (data, e) => {
            await props.onSave({
              userId: props.userId,
              userAvailabilityType: data.availability,
              startTime:
                data.availability == UserAvailability.Before ||
                data.availability == UserAvailability.After
                  ? secondsSinceMidnight(data.time ?? 0)
                  : undefined,
              description:
                data.reason && data.reason.length > 0 ? data.reason : undefined,
              startTimeLocal: data.fromDate,
              endTimeLocal:
                data.availability === UserAvailability.NotAvailable
                  ? data.toDate
                  : data.fromDate,
            });
          }}
          validationSchema={yup
            .object({
              availability: yup.string(),
              time: yup.string().when("availability", {
                is: UserAvailability.After || UserAvailability.Before,
                then: yup
                  .string()
                  .nullable()
                  .required(t("Time is required")),
                otherwise: yup.string().nullable(),
                fromDate: yup
                  .date()
                  .nullable()
                  .required(t("From date is required")),
                toDate: yup.date().nullable(),
              }),
            })
            .test({
              name: "fromDateInPast",
              test: function test(value) {
                if (isBefore(value.fromDate, addDays(today, -1))) {
                  return new yup.ValidationError(
                    t("Must not start in the past"),
                    null,
                    "fromDate"
                  );
                }

                return true;
              },
            })
            .test({
              name: "fromDateBeforeTo",
              test: function test(value) {
                if (
                  isBefore(value.toDate, value.fromDate) &&
                  value.availability === UserAvailability.NotAvailable
                ) {
                  return new yup.ValidationError(
                    t("Must be before from"),
                    null,
                    "toDate"
                  );
                }

                return true;
              },
            })}
        >
          {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={isMobile ? 12 : 2}>
                  <InputLabel>{t("I am")}</InputLabel>
                  <Select
                    value={{
                      value: values.availability,
                      label:
                        availabilityOptions.find(
                          e => e.value && e.value === values.availability
                        )?.label || "",
                    }}
                    multiple={false}
                    onChange={(value: OptionType) => {
                      setFieldValue("availability", value.value);
                    }}
                    options={availabilityOptions}
                    withResetValue={false}
                    doSort={false}
                  />
                </Grid>
                <Grid item xs={isMobile ? 6 : 2}>
                  <InputLabel>{t("From")}</InputLabel>
                  <DatePicker
                    variant={"single-hidden"}
                    startDate={values.fromDate}
                    onChange={({ startDate }) => {
                      setFieldValue("fromDate", startDate);
                      if (isAfterDate(startDate, values.fromDate)) {
                        setFieldValue("toDate", startDate);
                      }
                    }}
                    inputStatus={errors.fromDate ? "error" : "default"}
                    validationMessage={errors.fromDate}
                  />
                </Grid>
                {values.availability === UserAvailability.NotAvailable && (
                  <Grid item xs={isMobile ? 6 : 2}>
                    <InputLabel>{t("To")}</InputLabel>
                    <DatePicker
                      variant={"single-hidden"}
                      startDate={values.toDate}
                      onChange={({ startDate: toDate }) =>
                        setFieldValue("toDate", toDate)
                      }
                      inputStatus={errors.toDate ? "error" : "default"}
                      validationMessage={errors.toDate}
                    />
                  </Grid>
                )}
                {(values.availability == UserAvailability.Before ||
                  values.availability == UserAvailability.After) && (
                  <Grid item xs={isMobile ? 6 : 2}>
                    <InputLabel>{t("Time")}</InputLabel>
                    <FormikTimeInput
                      name={"time"}
                      value={values.time}
                      placeHolder={t("Eg. 9:00 am")}
                      inputStatus={errors.time ? "error" : "default"}
                    />
                  </Grid>
                )}
                <Grid item xs={isMobile ? 8 : 2}>
                  <InputLabel>{t("Reason")}</InputLabel>
                  <Input
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "reason",
                      placeholder: t("E.g Vacation"),
                      variant: "outlined",
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue("reason", e.currentTarget.value);
                      },
                      fullWidth: true,
                    }}
                  />
                </Grid>
                <Grid item xs={isMobile ? 4 : 2}>
                  <Button
                    onClick={submitForm}
                    variant="contained"
                    className={classes.addButton}
                  >
                    {t("Add")}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </Section>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  addButton: {
    marginTop: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(0),
  },
}));
