import * as React from "react";
import { AvailableJob } from "./available-job";
import { makeStyles } from "@material-ui/core/styles";

export default {
  title: "Components/AvailableJob",
};

export const AvailableJobSingleStory = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AvailableJob vacancy={simpleVacancy} shadeRow={false} />
    </div>
  );
};

export const AvailableJobMultipleStory = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AvailableJob vacancy={complexVacancy} shadeRow={false} />
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
  vacancyDetails: [
    {
      locationName: "Frank's school",
      startTimeLocal: "2019-11-20T08:00",
      endTimeLocal: "2019-11-20T15:00",
      dayPortion: 1,
    },
  ],
  orgName: "Frank's District",
  positionTypeName: "Kindergarten Teacher",
  employeeName: "Pam Thomas",
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-20T15:00",
  notesToReplacement: null,
  dayPortion: 1,
};

const complexVacancy = {
  id: "1",
  vacancyDetails: [
    {
      locationName: "Frank's school",
      startTimeLocal: "2019-11-20T08:00",
      endTimeLocal: "2019-11-20T15:00",
      dayPortion: 1,
    },
    {
      locationName: "Frank's Second school",
      startTimeLocal: "2019-11-21T08:00",
      endTimeLocal: "2019-11-21T15:00",
      dayPortion: 1,
    },
  ],
  orgName: "Frank's District",
  positionTypeName: "Kindergarten Teacher",
  employeeName: "Pam Thomas",
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-21T15:00",
  notesToReplacement:
    "These are notes for the subsitutute.  Please watch the class closely.",
  dayPortion: 2,
};
