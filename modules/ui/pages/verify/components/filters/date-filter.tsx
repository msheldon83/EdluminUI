import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { VerifyQueryFilters } from "./filter-params";
import { DatePicker } from "ui/components/form/date-picker";
import { format, parseISO, isValid } from "date-fns";
import { GetYesterdayTodayTomorrowFormat } from "helpers/date";

type Props = {
  setDate: (date: Date) => void;
} & Pick<VerifyQueryFilters, "date">;

export const DateFilter: React.FC<Props> = ({ date, setDate }) => {
  return (
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <DatePicker
        variant="single-hidden"
        startDate={date}
        endDate={date}
        onChange={({ startDate }) => {
          const startDateAsDate =
            typeof startDate === "string" ? parseISO(startDate) : startDate;

          if (startDateAsDate) {
            setDate(startDateAsDate);
          }
        }}
        startLabel="Date"
        dateFormat={"MMMM d, y"}
      />
    </Grid>
  );
};
