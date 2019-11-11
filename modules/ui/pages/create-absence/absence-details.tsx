import * as React from "react";
import { CreateAbsenceState, CreateAbsenceActions } from "./state";
import { Grid, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { DatePicker, DatePickerOnChange } from "ui/components/form/date-picker";

type Props = {
  state: CreateAbsenceState;
  dispatch: React.Dispatch<CreateAbsenceActions>;
};

export const AbsenceDetails: React.FC<Props> = ({ state, dispatch }) => {
  const onChange: DatePickerOnChange = React.useCallback(
    ({ startDate, endDate }) => {
      console.log("dates changed", startDate, endDate);
      // dispatch({ action: "selectDates", startDate, endDate });
    },
    [dispatch]
  );
  const { t } = useTranslation();
  return (
    <Grid container>
      <Grid item md={4}>
        <Typography variant="h5">{t("Time")}</Typography>
        <DatePicker
          startDate={state.startDate}
          endDate={state.endDate}
          onChange={onChange}
          startLabel={t("From")}
          endLabel={t("To")}
        />
      </Grid>
      <Grid item md={8}>
        <Typography variant="h5">{t("Reason")}</Typography>
        {/* <Select></Select> */}
      </Grid>
    </Grid>
  );
};
