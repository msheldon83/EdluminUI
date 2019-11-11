import * as React from "react";
import { CreateAbsenceState, CreateAbsenceActions } from "./state";
import { Grid, Typography, Button, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { DatePicker, DatePickerOnChange } from "ui/components/form/date-picker";
import { Select } from "ui/components/form/select";
import { classNames } from "react-select/src/utils";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useMemo } from "react";

type Props = {
  state: CreateAbsenceState;
  dispatch: React.Dispatch<CreateAbsenceActions>;
};

export const AbsenceDetails: React.FC<Props> = ({ state, dispatch }) => {
  const absenceReasons = useAbsenceReasons(state.organizationId);
  const absenceReasonOptions = useMemo(
    () => absenceReasons.map(r => ({ label: r.name, value: r.id })),
    [absenceReasons]
  );
  const classes = useStyles();
  const onDateChange: DatePickerOnChange = React.useCallback(
    ({ startDate, endDate }) => {
      console.log("dates changed", startDate, endDate);
      // dispatch({ action: "selectDates", startDate, endDate });
    },
    [dispatch]
  );
  const onReasonChange = React.useCallback(() => {}, [dispatch]);
  const { t } = useTranslation();
  return (
    <Grid container>
      <Grid item md={4}>
        <Typography variant="h5">{t("Time")}</Typography>
        <DatePicker
          startDate={state.startDate}
          endDate={state.endDate}
          onChange={onDateChange}
          startLabel={t("From")}
          endLabel={t("To")}
        />
      </Grid>
      <Grid item md={8}>
        <Typography variant="h5">{t("Reason")}</Typography>
        <Typography>{t("Select a reason")}</Typography>
        <Select
          value={null}
          options={absenceReasonOptions}
          label={t("Reason")}
          onChange={onReasonChange}
        ></Select>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.actionButtons}>
          <Button variant="contained">{t("Create")}</Button>
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));
