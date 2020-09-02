import * as React from "react";
import { useState } from "react";
import clsx from "clsx";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  UserAvailability,
  DayOfWeek,
  UserAvailableTimeInput,
} from "graphql/server-types.gen";
import { getDisplayName } from "ui/components/enumHelpers";
import { useIsMobile } from "hooks";
import * as yup from "yup";
import { Formik } from "formik";
import { OptionType, Select } from "ui/components/form/select";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { secondsSinceMidnight } from "helpers/time";
import { formatAvailabilityLabel, formatAvailableTime } from "./helpers";

type Props = {
  id?: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  availability?: UserAvailability;
  time?: number;
  onChange: (availableTime: UserAvailableTimeInput) => Promise<unknown>;
  isImpersonating: boolean;
};

export const SingleDay: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState(false);

  const isWeekend =
    props.dayOfWeek == DayOfWeek.Sunday ||
    props.dayOfWeek == DayOfWeek.Saturday;
  const isAvailable = props.availability != UserAvailability.NotAvailable;

  const availableTime = formatAvailableTime(props.time);
  const availabilityLabel = formatAvailabilityLabel(
    t,
    props.availability,
    props.time
  );
  const dayOfWeekLabel = getDisplayName("dayOfWeek", props.dayOfWeek, t);
  const mobileText = `${dayOfWeekLabel} - ${availabilityLabel}`;

  const availabilityOptions = [
    { label: t("Available"), value: UserAvailability.Available },
    { label: t("Before"), value: UserAvailability.Before },
    { label: t("After"), value: UserAvailability.After },
    { label: t("Not available"), value: UserAvailability.NotAvailable },
  ];

  return (
    <>
      <Formik
        initialValues={{
          availability: props.availability ?? UserAvailability.Available,
          time: props.time ? availableTime : undefined,
        }}
        onReset={(values, formProps) => {
          setEditing(false);
        }}
        onSubmit={async (data, e) => {
          if (editing) {
            const success = await props.onChange({
              id: props.id,
              userId: props.userId,
              userAvailabilityType: data.availability,
              availableTime:
                data.availability == UserAvailability.Before ||
                data.availability == UserAvailability.After
                  ? secondsSinceMidnight(data.time ?? 0)
                  : undefined,
              daysOfWeek: [props.dayOfWeek],
            });
            if (success) {
              setEditing(false);
            }
          } else {
            setEditing(true);
          }
        }}
        validationSchema={yup.object({
          availability: yup.string(),
          time: yup.string().when("availability", {
            is: UserAvailability.After || UserAvailability.Before,
            then: yup
              .string()
              .nullable()
              .required(t("Time is required")),
            otherwise: yup.string().nullable(),
          }),
        })}
      >
        {({
          values,
          handleSubmit,
          submitForm,
          setFieldValue,
          errors,
          handleReset,
        }) => (
          <form
            onSubmit={handleSubmit}
            className={clsx({
              [classes.weekend]: isWeekend,
              [classes.weekDay]: !isWeekend,
              [classes.dowBox]: true,
              [classes.mobileDowBox]: isMobile,
              [classes.desktopDowBox]: !isMobile,
              [classes.saturdayBox]: props.dayOfWeek === DayOfWeek.Saturday,
            })}
          >
            {editing ? (
              <Select
                className={
                  isMobile
                    ? classes.mobileAvailabilitySelect
                    : classes.availabilitySelect
                }
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
            ) : (
              !isMobile && (
                <div
                  className={clsx({
                    [classes.notAvailableText]: !isAvailable,
                    [classes.dowText]: true,
                  })}
                >
                  {dayOfWeekLabel}
                </div>
              )
            )}
            {editing ? (
              (values.availability == UserAvailability.Before ||
                values.availability == UserAvailability.After) && (
                <FormikTimeInput
                  name={"time"}
                  value={values.time}
                  placeHolder={t("Eg. 9:00 am")}
                  className={
                    isMobile ? classes.mobileTimeInput : classes.timeInput
                  }
                  inputStatus={errors.time ? "error" : "default"}
                />
              )
            ) : (
              <div
                className={clsx({
                  [classes.notAvailableText]: !isAvailable,
                  [classes.availablityText]: true,
                })}
              >
                {isMobile ? mobileText : availabilityLabel}
              </div>
            )}
            <div className={classes.buttonContainer}>
              {editing && (
                <Button
                  onClick={handleReset}
                  variant="text"
                  className={classes.changeButton}
                >
                  {t("Cancel")}
                </Button>
              )}
              {!props.isImpersonating && (
                <Button
                  onClick={submitForm}
                  variant="text"
                  className={classes.changeButton}
                >
                  {editing ? t("Save") : t("Change")}
                </Button>
              )}
            </div>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  mobileDowBox: {
    width: "100%",
    padding: theme.spacing(1, 1, 1, 1),
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  desktopDowBox: {
    width: theme.typography.pxToRem(142),
    height: theme.typography.pxToRem(133),
    marginRight: theme.spacing(1),
    textAlign: "center",
  },
  dowBox: {
    borderRadius: "4px",
    marginBottom: theme.spacing(1),
    position: "relative",
  },
  saturdayBox: {
    marginRight: theme.spacing(0),
  },
  weekDay: {
    border: "1px solid #050039",
  },
  weekend: {
    backgroundColor: "#F8F8F8",
  },
  notAvailableText: {
    fontColor: theme.customColors.edluminSubText,
  },
  dowText: {
    fontSize: theme.typography.pxToRem(24),
    paddingTop: theme.spacing(2),
  },
  availablityText: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 600,
  },
  buttonContainer: {
    position: "relative",
  },
  changeButton: {
    fontSize: theme.typography.pxToRem(14),
    fontColor: "#050039",
    textDecoration: "underline",
  },
  availabilitySelect: {
    padding: theme.spacing(0.5, 0.5, 0.5, 0.5),
    width: "100%",
  },
  mobileAvailabilitySelect: {
    padding: theme.spacing(0.5, 0.5, 0.5, 0.5),
    width: "50%",
  },
  timeInput: {
    padding: theme.spacing(0.5, 0.5, 0, 0.5),
    width: "100%",
  },
  mobileTimeInput: {
    padding: theme.spacing(0.5, 0.5, 0.5, 0.5),
    width: "50%",
  },
}));
