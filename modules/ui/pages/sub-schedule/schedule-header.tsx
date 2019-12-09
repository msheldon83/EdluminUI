import { Grid, InputLabel, Typography } from "@material-ui/core";
import { isSameDay, parseISO } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Select, OptionType } from "ui/components/form/select";

type Props = {
  view: "list" | "calendar";
  numberOfMonthsInSchoolYear: number;
  today: Date;
  beginningOfSchoolYear: Date;
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
};

export const ScheduleHeader: React.FC<Props> = props => {
  const { t } = useTranslation();

  const listViewFilterOptions = [
    { label: t("Today"), value: props.today.toISOString() },
    {
      label: t("Beginning of the school year"),
      value: props.beginningOfSchoolYear.toISOString(),
    },
  ];
  return (
    <>
      {props.view === "calendar" ? (
        <Typography variant="h5">{`${t("Upcoming")} ${
          props.numberOfMonthsInSchoolYear
        } ${t("months")}`}</Typography>
      ) : (
        <Grid item>
          <InputLabel>{t("From")}</InputLabel>
          <Select
            withDropdownIndicator
            onChange={val =>
              val &&
              props.setStartDate(
                parseISO((val as typeof listViewFilterOptions[0]).value)
              )
            }
            value={listViewFilterOptions.find(o =>
              isSameDay(parseISO(o.value), props.startDate)
            )}
            isClearable={false}
            options={listViewFilterOptions}
          />
        </Grid>
      )}
    </>
  );
};
