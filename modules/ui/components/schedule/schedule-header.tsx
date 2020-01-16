import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { isSameDay, parseISO, isWithinInterval } from "date-fns";
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
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  setEndDate: React.Dispatch<React.SetStateAction<Date>>;
  userId?: string;
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
    flexDirection: props.isMobile ? ("column" as "column") : ("row" as "row"),
  }),
  select: (props: StyleProps) => ({
    display: "flex",
    flexDirection: "column" as "column",
    minWidth: theme.typography.pxToRem(props.isMobile ? 125 : 225),
  }),
  fromSelect: {
    minWidth: theme.typography.pxToRem(225),
  },
  spacing: (props: StyleProps) => ({
    marginLeft: props.isMobile ? 0 : theme.spacing(6),
  }),
}));
