import * as React from "react";
import {
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { Period, Schedule, buildNewSchedule } from "./helpers";

type Props = {
  index: number;
  locationOptions: OptionType[];
  bellScheduleOptions: OptionType[];
  allDay: boolean;
  allDayDisabled: boolean;
  period: Period;
  lastPeriod: boolean;
  onChangeLocation?: (locationId: string) => void;
  onChangeBellSchedule?: (bellScheduleId: string) => void;
  onCheckAllDay?: (checked: boolean) => void;
  onAddSchool: () => void;
  onRemoveSchool: (periodNumber: number) => void;
  scheduleNumber: string;
};

export const PeriodUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const period = props.period;
  const classes = useStyles();

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography>{t("Location")}</Typography>
          <SelectNew
            value={{
              value: period.locationId ?? "",
              label:
                props.locationOptions.find(
                  e => e.value && e.value === period.locationId
                )?.label || "",
            }}
            multiple={false}
            onChange={(value: OptionType) => {
              const id = (value as OptionTypeBase).value.toString();
              props.onChangeLocation(id);
            }}
            options={props.locationOptions}
            withResetValue={false}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography>{t("Bell Schedule")}</Typography>
          <SelectNew
            value={{
              value: period.bellScheduleId ?? "",
              label:
                props.bellScheduleOptions.find(
                  e => e.value && e.value === period.bellScheduleId
                )?.label || "",
            }}
            multiple={false}
            onChange={(value: OptionType) => {
              const id = (value as OptionTypeBase).value.toString();
              props.onChangeBellSchedule(id);
            }}
            options={props.bellScheduleOptions}
            withResetValue={false}
          />
        </Grid>
        <Grid container item xs={6} spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Typography>{t("Starting")}</Typography>
            <FormikTimeInput
              label=""
              name={`periods[${props.index}].startTime`}
              value={period.startTime || undefined}
              //earliestTime={earliestStartTime}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography>{t("Ending")}</Typography>
            <FormikTimeInput
              label=""
              name={`periods[${props.index}].endTime`}
              value={period.startTime || undefined}
              //earliestTime={earliestStartTime}
            />
          </Grid>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={props.allDay}
                onChange={e => props.onCheckAllDay(!props.allDay)}
                disabled={props.allDayDisabled}
              />
            }
            label={t("All Day")}
          />
        </Grid>
        <Grid container item xs={12} spacing={2}>
          {props.index != 0 && (
            <Grid item>
              <TextButton
                className={classes.redLink}
                onClick={() => props.onRemoveSchool(props.index)}
              >
                {t("Remove school")}
              </TextButton>
            </Grid>
          )}
          {props.lastPeriod && (
            <Grid item>
              <TextButton color="primary" onClick={() => props.onAddSchool()}>
                {`${t("Add another School to schedule")}${
                  props.scheduleNumber
                }`}
              </TextButton>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedContainer: {
    backgroundColor: "#F5F5F5",
    marginLeft: theme.spacing(1),
  },
  redLink: {
    color: theme.customColors.darkRed,
    textDecoration: "underline",
  },
  headingText: {
    fontSize: theme.typography.pxToRem(16),
    fontStyle: "bold",
  },
}));
