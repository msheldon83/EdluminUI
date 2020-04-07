import * as React from "react";
import { AvailableJob } from "./available-job";
import { makeStyles } from "@material-ui/core/styles";
import { Vacancy } from "graphql/server-types.gen";

export default {
  title: "Pages/Sub Home/AvailableJob",
};

const onDismiss = async (vacancyId: string) => {};
const onAccept = async (vacancyId: string) => {};

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
  const vacancyWithoutNotes = {
    ...complexVacancy,
    notesToReplacement: undefined,
  };
  return (
    <div className={classes.container}>
      <AvailableJob
        vacancy={complexVacancy}
        shadeRow={false}
        onDismiss={onDismiss}
        onAccept={onAccept}
      />
      {/* to get a sense of how they look in sequence */}
      <AvailableJob
        vacancy={vacancyWithoutNotes}
        shadeRow={true}
        onDismiss={onDismiss}
        onAccept={onAccept}
      />
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

const simpleVacancy = {
  id: "1",
  details: [
    {
      location: { name: "Frank's school" },
      startTimeLocal: "2019-11-20T08:00",
      endTimeLocal: "2019-11-20T15:00",
      dayPortion: 1,
    },
  ],
  organization: { id: "1234", name: "Frank's District" },
  position: { title: "Kindergarten Teacher" },
  absence: { id: "1234", employee: { firstName: "Pam", lastName: "Thomas" } },
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-20T15:00",
  startDate: "2019-11-20",
  endDate: "2019-11-20",
  notesToReplacement: null,
  totalDayPortion: 1,
};

const complexVacancy = {
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
    {
      location: { name: "Another school" },
      startTimeLocal: "2019-11-22T08:00",
      endTimeLocal: "2019-11-22T11:30",
      dayPortion: 0.5,
    },
  ],
  organization: { id: "1234", name: "Frank's District" },
  position: { title: "Kindergarten Teacher" },
  absence: { id: "1234", employee: { firstName: "Pam", lastName: "Thomas" } },
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-22T11:30",
  startDate: "2019-11-20",
  endDate: "2019-11-22",
  notesToReplacement: "These are notes for the substitute.",
  totalDayPortion: 2.5,
};

const halfDayAM = {
  id: "1",
  details: [
    {
      location: { name: "Frank's school" },
      startTimeLocal: "2019-11-20T08:00",
      endTimeLocal: "2019-11-20T11:00",
      dayPortion: 0.5,
    },
  ],
  organization: { id: "1234", name: "Frank's District" },
  position: { title: "Kindergarten Teacher" },
  absence: { id: "1234", employee: { firstName: "Pam", lastName: "Thomas" } },
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-20T11:00",
  startDate: "2019-11-20",
  endDate: "2019-11-20",
  notesToReplacement: null,
  totalDayPortion: 0.5,
};
