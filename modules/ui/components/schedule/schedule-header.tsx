import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { isSameDay, parseISO, isWithinInterval, addDays } from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SelectNew } from "ui/components/form/select-new";
import { useQueryBundle } from "graphql/hooks";
import { GetUserCreateDate } from "../../pages/sub-schedule/graphql/get-user-create-date.gen";
import { range } from "lodash-es";
import { stringToStartAndEndDate, createYearOption } from "./helpers";
import { useIsMobile } from "hooks";

type Props = {
  view: "list" | "calendar";
  today: Date;
  beginningOfCurrentSchoolYear: Date;
  endOfSchoolCurrentYear: Date;
  userCreatedDate: Date;
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date>>;
};

export const ScheduleHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles({ isMobile });

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

  const schoolYearOptions = useMemo(() => {
    const startYear = props.userCreatedDate.getFullYear();
    const endYear = props.endOfSchoolCurrentYear.getFullYear();

    // 1. fill in the years between the startYear and the current year
    // 2. create the respective values for each
    // Range creates a range up to but not including the second values, so need to add 1 to include the endYear
    const yearOptions =
      startYear !== endYear
        ? range(startYear, endYear + 1).map(d => {
            const year = props.userCreatedDate;
            year.setFullYear(d);
            return createYearOption(year);
          })
        : [createYearOption(props.beginningOfCurrentSchoolYear)];

    // Always add the next school year to the list
    yearOptions.push(
      createYearOption(addDays(props.endOfSchoolCurrentYear, 1))
    );
    return yearOptions;
  }, [
    props.beginningOfCurrentSchoolYear,
    props.endOfSchoolCurrentYear,
    props.userCreatedDate,
  ]);

  return (
    <div className={classes.selectContainer}>
      <div className={classes.select}>
        {props.view === "list" && <InputLabel>{t("Year")}</InputLabel>}
        <SelectNew
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
          multiple={false}
          options={schoolYearOptions}
          withResetValue={false}
        />
      </div>
      {props.view === "list" && showFromPicker && (
        <div
          className={[classes.select, classes.fromSelect, classes.spacing].join(
            " "
          )}
        >
          <InputLabel>{t("From")}</InputLabel>
          <SelectNew
            onChange={val =>
              val &&
              props.setStartDate(
                parseISO((val as typeof listViewFilterOptions[0]).value)
              )
            }
            value={listViewFilterOptions.find(o =>
              isSameDay(parseISO(o.value), props.startDate)
            )}
            options={listViewFilterOptions}
            multiple={false}
            withResetValue={false}
          />
        </div>
      )}
    </div>
  );
};

type StyleProps = {
  isMobile: boolean;
};

const useStyles = makeStyles(theme => ({
  selectContainer: (props: StyleProps) => ({
    display: "flex",
    flexDirection: props.isMobile ? ("column" as const) : ("row" as const),
  }),
  select: (props: StyleProps) => ({
    display: "flex",
    flexDirection: "column" as const,
    minWidth: theme.typography.pxToRem(props.isMobile ? 125 : 225),
  }),
  fromSelect: {
    minWidth: theme.typography.pxToRem(225),
  },
  spacing: (props: StyleProps) => ({
    marginLeft: props.isMobile ? 0 : theme.spacing(6),
  }),
}));
