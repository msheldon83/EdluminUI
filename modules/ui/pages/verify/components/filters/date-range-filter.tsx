import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";
import { DateRangePickerPopover } from "ui/components/form/date-range-picker-popover";
import { VerifyQueryFilters } from "./filter-params";
import { endOfToday } from "date-fns";

type Props = {
  setDateRange: (start: Date, end: Date) => void;
} & VerifyQueryFilters;

export const DateRangeFilter: React.FC<Props> = ({
  setDateRange,
  dateRangeStart,
  dateRangeEnd,
}) => {
  const { t } = useTranslation();

  const start = new Date(dateRangeStart);
  const end = new Date(dateRangeEnd);
  const today = endOfToday();

  return (
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <DateRangePickerPopover
        startDate={start}
        endDate={end}
        maximumDate={today}
        placeholder={t("Select dates")}
        onDateRangeSelected={setDateRange}
        useStandardWidth
      />
    </Grid>
  );
};
