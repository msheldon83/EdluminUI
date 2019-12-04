import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { makeStyles } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import { useState, useMemo, useEffect } from "react";
import { DateTabs } from "./components/tabs";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { VerifyRoute } from "ui/routes/absence-vacancy/verify";
import { GetAssignmentCount } from "./graphql/get-assignment-count.gen";
import { GetVacancyDetails } from "./graphql/get-vacancydetails.gen";
import {
  isToday,
  addDays,
  isWeekend,
  format,
  isEqual,
  startOfToday,
} from "date-fns";
import { VacancyDetailCount, VacancyDetail } from "graphql/server-types.gen";
import { Assignment } from "./components/assignment";

type Props = {
  showVerified: boolean;
  locationsFilter: number[];
  showLinkToVerify?: boolean;
  date?: Date;
  setDate?: (date: Date) => void;
};

export const VerifyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(VerifyRoute);

  const today = useMemo(() => startOfToday(), []);
  /* Because this UI can stand alone or show up on the Admin homepage, we need
    to account for only controlling the selectedDate within here as well
    as the scenario where the selected date is provided to us through props.
    To handle that make sure to use "selectedDateToUse" when trying 
    to retrieve the currently selected date */
  const [selectedDateTab, setSelectedDateTab] = useState<Date>(today);
  let selectedDateToUse = props.date ? props.date : selectedDateTab;

  const getAssignmentCounts = useQueryBundle(GetAssignmentCount, {
    variables: {
      orgId: params.organizationId,
      locationIds: props.locationsFilter,
    },
  });

  const assignmentCounts = (getAssignmentCounts.state === "LOADING"
    ? []
    : getAssignmentCounts.data?.vacancy?.getCountOfAssignmentsForVerify ??
      []) as VacancyDetailCount[];

  const dateTabOptions: {
    date: Date;
    dateLabel: string;
    count: number;
  }[] = useMemo(() => [], [assignmentCounts]);

  // If the date is controlled outside this component, track local state change
  // and call the provided setDate function in props
  useEffect(() => {
    if (props.setDate) {
      props.setDate(selectedDateTab);
    }
  }, [selectedDateTab]);

  // Determines what tabs are shown and the count of unverified assignments on each tab
  // We show today and each day of the last week unless weekends have 0
  // Older then shows a count of all unverified going back to the start of the school year
  useEffect(() => {
    let date = today;
    let totalCount = assignmentCounts
      .map(x => x.count)
      .reduce((prev: number, curr: number) => prev + curr, 0);

    for (let i = 0; i < 9; i++) {
      let count = 0;
      if (i === 8) {
        dateTabOptions.push({
          date: date,
          dateLabel: t("Older"),
          count: totalCount,
        });
      } else {
        const dateToFind = format(date, "YYY-MM-dd");
        const index = assignmentCounts.findIndex(x => x.date === dateToFind);
        if (index != -1) {
          count = assignmentCounts[index].count;
          totalCount = totalCount - count;
        }
        if (isToday(date)) {
          dateTabOptions.push({
            date: date,
            dateLabel: t("Today"),
            count: count,
          });
        } else if (!isWeekend(date) || count !== 0) {
          dateTabOptions.push({
            date: date,
            dateLabel: format(date, "EEE, MMM d"),
            count: count,
          });
        }
        date = addDays(date, -1);
      }
    }
  }, [assignmentCounts, today, dateTabOptions, t]);

  // If we're given a date we don't actually have in our list of
  // tabs, keep the focus to Today
  if (!dateTabOptions.find(d => isEqual(d.date, selectedDateToUse))) {
    selectedDateToUse = today;
  }

  const getVacancyDetails = useQueryBundle(GetVacancyDetails, {
    variables: {
      orgId: params.organizationId,
      includeVerified: props.showVerified,
      locationIds: props.locationsFilter,
      fromDate: isEqual(selectedDateToUse, addDays(today, -8))
        ? null
        : selectedDateToUse,
      toDate: selectedDateToUse,
    },
  });

  const assignments = (getVacancyDetails.state === "LOADING"
    ? []
    : getVacancyDetails.data?.vacancy?.getAssignmentsForVerify ?? []) as Pick<
    VacancyDetail,
    | "id"
    | "startTimeLocal"
    | "endTimeLocal"
    | "assignment"
    | "payCode"
    | "location"
    | "vacancy"
    | "dayPortion"
  >[];

  const onVerify = async (vacancyDetailId: string) => {};

  return (
    <>
      <DateTabs
        selectedDateTab={selectedDateToUse}
        setSelectedDateTab={setSelectedDateTab}
        dateTabOptions={dateTabOptions}
        showLinkToVerify={props.showLinkToVerify}
      />
      <Section>
        {getVacancyDetails.state === "LOADING" ? (
          <Typography variant="h5">
            {t("Loading substitute assignments")}
          </Typography>
        ) : assignments.length === 0 ? (
          <Typography variant="h5">{t("All assignments verified")}</Typography>
        ) : (
          assignments.map((vacancyDetail, index) => (
            // TODO: if we are on the Older tab, we need to group the vacancies by date
            <Assignment
              key={index}
              vacancyDetail={vacancyDetail}
              shadeRow={index % 2 != 0}
              onVerify={onVerify}
            />
          ))
        )}
      </Section>
    </>
  );
};

export const useStyles = makeStyles(theme => ({}));
