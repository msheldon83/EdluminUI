import { Grid, InputLabel, Typography, makeStyles } from "@material-ui/core";
import { isSameDay, parseISO } from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "ui/components/form/select";

type Props = {
  view: "list" | "calendar";
  today: Date;
  beginningOfSchoolYear: Date;
  endOfSchoolYear: Date;
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
};

export const ScheduleHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const schoolYear = useMemo(
    () =>
      `${props.beginningOfSchoolYear.getFullYear()}-${props.endOfSchoolYear.getFullYear()}`,
    [props.beginningOfSchoolYear, props.endOfSchoolYear]
  );

  const listViewFilterOptions = [
    { label: t("Today"), value: props.today.toISOString() },
    {
      label: t("Beginning of the school year"),
      value: props.beginningOfSchoolYear.toISOString(),
    },
  ];
  return (
    <>
      <div className={classes.years}>
        <Typography variant="h5">{schoolYear}</Typography>
      </div>

      {props.view === "list" && (
        <div className={classes.select}>
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
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  years: {
    paddingTop: theme.spacing(2),
  },
  select: {
    display: "flex",
    flexDirection: "column",
    minWidth: theme.typography.pxToRem(250),
    marginLeft: theme.spacing(6),
  },
}));
