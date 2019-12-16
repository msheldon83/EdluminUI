import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { isSameDay, parseISO, isWithinInterval } from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "ui/components/form/select";
import { useQueryBundle } from "graphql/hooks";
import { GetUserCreateDate } from "../../pages/sub-schedule/graphql/get-user-create-date.gen";
import { range } from "lodash-es";
import { stringToStartAndEndDate, createYearOption } from "./helpers";

type Props = {
  view: "list" | "calendar";
  today: Date;
  beginningOfCurrentSchoolYear: Date;
  endOfSchoolCurrentYear: Date;
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date>>;
  userId?: string;
};

export const ScheduleHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const showFromPicker = isWithinInterval(props.startDate, {
    start: props.beginningOfCurrentSchoolYear,
    end: props.endOfSchoolCurrentYear,
  });

  const listViewFilterOptions = useMemo(
    () => [
      { label: t("Today"), value: props.today.toISOString() },
      {
        label: t("Beginning of the school year"),
        value: props.beginningOfCurrentSchoolYear.toISOString(),
      },
    ],
    [props.today, props.beginningOfCurrentSchoolYear, t]
  );

  const startYearForUser = useQueryBundle(GetUserCreateDate, {
    variables: {
      id: props.userId,
    },
    skip: !props.userId,
  });

  const schoolYearOptions = useMemo(() => {
    if (
      startYearForUser.state !== "DONE" &&
      startYearForUser.state !== "UPDATING"
    )
      return [];
    const userStartDate = parseISO(
      startYearForUser.data.user?.byId?.createdUtc
    );
    const startYear = userStartDate.getFullYear();
    const endYear = props.endOfSchoolCurrentYear.getFullYear();

    // 1. fill in the years between the startYear and the current year
    // 2. create the respective values for each
    return startYear !== endYear
      ? range(startYear, endYear).map(d => {
          const year = userStartDate;
          year.setFullYear(d);
          return createYearOption(year);
        })
      : [createYearOption(props.beginningOfCurrentSchoolYear)];
  }, [
    props.beginningOfCurrentSchoolYear,
    props.endOfSchoolCurrentYear,
    startYearForUser,
  ]);

  if (
    startYearForUser.state !== "DONE" &&
    startYearForUser.state !== "UPDATING"
  ) {
    return <></>;
  }

  return (
    <>
      <div className={classes.select}>
        {props.view === "list" && <InputLabel>{t("Year")}</InputLabel>}
        <Select
          withDropdownIndicator
          onChange={val => {
            const dates = stringToStartAndEndDate(
              (val as typeof schoolYearOptions[0]).value
            );
            if (dates) {
              props.setStartDate(dates.startDate);
              props.setEndDate(dates.endDate);
            }
          }}
          value={schoolYearOptions.find(y => {
            const dates = stringToStartAndEndDate(y.value);

            return (
              dates &&
              isWithinInterval(props.startDate, {
                start: dates.startDate,
                end: dates.endDate,
              })
            );
          })}
          isClearable={false}
          options={schoolYearOptions}
        />
      </div>

      {props.view === "list" && showFromPicker && (
        <div className={[classes.select, classes.fromSelect].join(" ")}>
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
  select: {
    display: "flex",
    flexDirection: "column",
    minWidth: theme.typography.pxToRem(250),
  },
  fromSelect: {
    marginLeft: theme.spacing(6),
  },
}));
