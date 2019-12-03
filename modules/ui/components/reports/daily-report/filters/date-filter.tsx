import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { FilterQueryParams, DailyReportQueryFilters } from "./filter-params";
import { useStyles } from "./index";
import { DatePicker } from "ui/components/form/date-picker";
import { format, parseISO, isValid } from "date-fns";
import { GetYesterdayTodayTomorrowFormat } from "helpers/date";

type Props = {
  dateLabel: string;
  setDate: (date: Date) => void;
} & DailyReportQueryFilters;

export const DateFilter: React.FC<Props> = props => {
  const classes = useStyles();
  const dateFilterAsDate = new Date(props.date);

  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <DatePicker
          variant="single-hidden"
          startDate={dateFilterAsDate}
          endDate={dateFilterAsDate}
          onChange={({ startDate }) => {
            const startDateAsDate =
              typeof startDate === "string" ? parseISO(startDate) : startDate;

            if (startDateAsDate) {
              props.setDate(startDateAsDate);
            }
          }}
          startLabel={props.dateLabel}
          dateFormat={GetYesterdayTodayTomorrowFormat(
            dateFilterAsDate,
            "MMMM d"
          )}
        />
      </Grid>
    </>
  );
};
