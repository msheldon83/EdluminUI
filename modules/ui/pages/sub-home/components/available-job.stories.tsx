import * as React from "react";
import { AvailableJob } from "./available-job";
import { makeStyles } from "@material-ui/core/styles";

export default {
  title: "Components/AvailableJob",
};

const testVacancy = {
  id: "1",
  vacancyDetail: [
    {
      locationName: "Frank's school",
      startTimeLocal: "2019-11-20",
      endTimeLocal: "2019-11-20",
      dayPortion: 1,
    },
  ],
  orgName: "Frank's District",
  positionTypeName: "Kindergarten Teacher",
  employeeName: "Pam Thomas",
  startDate: "2019-11-20",
  endDate: "2019-11-20",
  notesToReplacement: "No notes",
};

export const AvailableJobStory = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AvailableJob vacancy={testVacancy} />
    </div>
  );
};

AvailableJobStory.story = {
  name: "Available Job",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    width: "100%",
  },
}));
