import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { isSameDay, parseISO, getYear } from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Select } from "ui/components/form/select";
import { GetUserCreateDate } from "./graphql/get-user-create-date.gen";
import { useQueryBundle } from "graphql/hooks";

type Props = {
  view: "list" | "calendar";
  today: Date;
  beginningOfSchoolYear: Date;
  endOfSchoolYear: Date;
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  userId?: string;
};

export const ScheduleHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const listViewFilterOptions = useMemo(
    () => [
      { label: t("Today"), value: props.today.toISOString() },
      {
        label: t("Beginning of the school year"),
        value: props.beginningOfSchoolYear.toISOString(),
      },
    ],
    [props.today, props.beginningOfSchoolYear, t]
  );

  const currentSchoolYear = useMemo(
    () =>
      `${props.beginningOfSchoolYear.getFullYear()}-${props.endOfSchoolYear.getFullYear()}`,
    [props.beginningOfSchoolYear, props.endOfSchoolYear]
  );

  //////////////////////////////////////////////////////////////
  const startYearForSub = useQueryBundle(GetUserCreateDate, {
    variables: {
      id: props.userId,
    },
    skip: !props.userId,
  });

  // 1. fill in the years between the startYear and the current year
  // 2. create the respective values for each
  // 3. make the select generic
  const schoolYearOptions = useMemo(
    () => [
      {
        label: currentSchoolYear,
        value: {
          startDate: props.beginningOfSchoolYear,
          endDate: props.endOfSchoolYear,
        },
      },
    ],
    []
  );
  if (
    startYearForSub.state !== "DONE" &&
    startYearForSub.state !== "UPDATING"
  ) {
    return <></>;
  }
  const startYear = getYear(
    parseISO(startYearForSub.data.user?.byId?.createdUtc)
  );
  console.log(startYear, startYearForSub.data.user?.byId?.createdUtc);

  return (
    <>
      <div className={classes.select}>
        {props.view === "list" && <InputLabel>{t("Year")}</InputLabel>}
        <Select
          withDropdownIndicator
          onChange={
            val => console.log(val)
            // val &&
            // props.setStartDate(
            //   parseISO((val as typeof listViewFilterOptions[0]).value)
            // )
          }
          value={schoolYearOptions[0]}
          isClearable={false}
          options={schoolYearOptions}
        />
      </div>

      {props.view === "list" && (
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
