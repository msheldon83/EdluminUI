import * as React from "react";
import { Vacancy } from "../vacancy";
import { TestCases } from "./testCases";
import { makeStyles } from "@material-ui/core";

export const VacancySummary = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Vacancy
        vacancySummaryDetails={TestCases.singleDayNoAssignment}
        setNotesForSubstitute={() => {}}
        onAssignClick={async () => {}}
        onRemoveClick={async () => {}}
      />
    </div>
  );
};

VacancySummary.story = {
  name: "Vacancy Summary",
};

const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: theme.typography.pxToRem(500),
    width: "100%",
  },
}));
