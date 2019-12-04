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
import { isToday, addDays, isWeekend, format, isEqual } from "date-fns";
import { VacancyDetailCount, VacancyDetail } from "graphql/server-types.gen";
import { Assignment } from "./components/assignment";

type Props = {
  showVerified: boolean;
  locationsFilter: number[];
  showLinkToVerify?: boolean;
};

export const VerifyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(VerifyRoute);

  const today = useMemo(() => new Date(), []);
  const [selectedDateTab, setSelectedDateTab] = useState<Date>(today);

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

  const getVacancyDetails = useQueryBundle(GetVacancyDetails, {
    variables: {
      orgId: params.organizationId,
      includeVerified: props.showVerified,
      locationIds: props.locationsFilter,
      fromDate: isEqual(selectedDateTab, addDays(today, -8))
        ? null
        : selectedDateTab,
      toDate: selectedDateTab,
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
        selectedDateTab={selectedDateTab}
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
