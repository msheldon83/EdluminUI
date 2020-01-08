import * as React from "react";
import { AvailableJob } from "./available-job";
import { makeStyles } from "@material-ui/core/styles";
import { Vacancy } from "graphql/server-types.gen";

export default {
  title: "Pages/Sub Home/AvailableJob",
};

const onDismiss = async (orgId: string, vacancyId: string) => {};
const onAccept = async (orgId: string, vacancyId: string) => {};

export const AvailableJobSingleStory = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AvailableJob
        vacancy={simpleVacancy}
        shadeRow={false}
        onDismiss={onDismiss}
        onAccept={onAccept}
      />
      <AvailableJob
        vacancy={halfDayAM}
        shadeRow={true}
        onDismiss={onDismiss}
        onAccept={onAccept}
      />
    </div>
  );
};

export const AvailableJobMultipleStory = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AvailableJob
        vacancy={complexVacancy}
        shadeRow={false}
        onDismiss={onDismiss}
        onAccept={onAccept}
      />
    </div>
  );
};

AvailableJobSingleStory.story = {
  name: "Single Day/Location Job",
};

AvailableJobMultipleStory.story = {
  name: "Multi Day Job",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    width: "100%",
  },
}));

const simpleVacancy = ({
  id: "1",
  details: [
    {
      location: { name: "Frank's school" },
      startTimeLocal: "2019-11-20T08:00",
      endTimeLocal: "2019-11-20T15:00",
      dayPortion: 1,
    },
  ],
  organization: { name: "Frank's District" },
  position: { name: "Kindergarten Teacher" },
  absence: { employee: { firstName: "Pam", lastName: "Thomas" } },
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-20T15:00",
  startDate: "2019-11-20",
  endDate: "2019-11-20",
  notesToReplacement: null,
  totalDayPortion: 1,
} as unknown) as Pick<
  Vacancy,
  | "id"
  | "organization"
  | "position"
  | "absence"
  | "startTimeLocal"
  | "endTimeLocal"
  | "startDate"
  | "endDate"
  | "notesToReplacement"
  | "totalDayPortion"
  | "details"
>;

const complexVacancy = ({
  id: "1",
  details: [
    {
      location: { name: "Frank's school" },
      startTimeLocal: "2019-11-20T08:00",
      endTimeLocal: "2019-11-20T15:00",
      dayPortion: 1,
    },
    {
      location: { name: "Frank's school" },
      startTimeLocal: "2019-11-21T08:00",
      endTimeLocal: "2019-11-21T15:00",
      dayPortion: 1,
    },
  ],
  organization: { name: "Frank's District" },
  position: { name: "Kindergarten Teacher" },
  absence: { employee: { firstName: "Pam", lastName: "Thomas" } },
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-21T15:00",
  startDate: "2019-11-20",
  endDate: "2019-11-21",
  notesToReplacement: "These are notes for the substitute.",
  totalDayPortion: 2,
} as unknown) as Pick<
  Vacancy,
  | "id"
  | "organization"
  | "position"
  | "absence"
  | "startTimeLocal"
  | "endTimeLocal"
  | "startDate"
  | "endDate"
  | "notesToReplacement"
  | "totalDayPortion"
  | "details"
>;

const halfDayAM = ({
  id: "1",
  details: [
    {
      location: { name: "Frank's school" },
      startTimeLocal: "2019-11-20T08:00",
      endTimeLocal: "2019-11-20T11:00",
      dayPortion: 0.5,
    },
  ],
  organization: { name: "Frank's District" },
  position: { name: "Kindergarten Teacher" },
  absence: { employee: { firstName: "Pam", lastName: "Thomas" } },
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-20T11:00",
  startDate: "2019-11-20",
  endDate: "2019-11-20",
  notesToReplacement: null,
  totalDayPortion: 0.5,
} as unknown) as Pick<
  Vacancy,
  | "id"
  | "organization"
  | "position"
  | "absence"
  | "startTimeLocal"
  | "endTimeLocal"
  | "startDate"
  | "endDate"
  | "notesToReplacement"
  | "totalDayPortion"
  | "details"
>;
