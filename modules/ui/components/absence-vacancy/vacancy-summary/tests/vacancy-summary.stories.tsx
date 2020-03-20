import * as React from "react";
import { VacancySummary } from "../vacancy-summary";
import { TestCases } from "./testCases";
import { makeStyles } from "@material-ui/core";
import { mockProvider } from "test-helpers/mock-provider";
import { Route } from "react-router";
import { AppChromeRoute } from "ui/routes/app-chrome";

export default {
  title: "Components/Vacancy Summary",
};

export const SingleDayUnassigned = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <VacancySummary
        vacancySummaryDetails={TestCases.singleDayNoAssignment}
        setNotesForSubstitute={() => {}}
        onAssignClick={async () => {}}
        onCancelAssignment={async () => {}}
      />
    </div>
  );
};

export const SingleDayAssigned = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <VacancySummary
        vacancySummaryDetails={TestCases.singleDayWithAssignment}
        setNotesForSubstitute={() => {}}
        onAssignClick={async () => {}}
        onCancelAssignment={async () => {}}
      />
    </div>
  );
};

export const SingleDayPrearranged = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <VacancySummary
        vacancySummaryDetails={TestCases.singleDayPrearranged}
        setNotesForSubstitute={() => {}}
        onAssignClick={async () => {}}
        onCancelAssignment={async () => {}}
      />
    </div>
  );
};

export const MultiDayUnassigned = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <VacancySummary
        vacancySummaryDetails={
          TestCases.multipleDaysNoAssignmentAccountingCodesInDifferentOrder
        }
        setNotesForSubstitute={() => {}}
        onAssignClick={async () => {}}
        onCancelAssignment={async () => {}}
      />
    </div>
  );
};

export const MultiDayAssigned = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <VacancySummary
        vacancySummaryDetails={TestCases.multipleDaysSingleAssignmentForAll}
        setNotesForSubstitute={() => {}}
        onAssignClick={async () => {}}
        onCancelAssignment={async () => {}}
      />
    </div>
  );
};

export const MultiDaySplitAssignment = () => {
  const classes = useStyles();
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            //id: "1234",
            user: {
              id: "1234" as string,
            },
            isSystemAdministrator: true,
          },
        }),
      }),
    },
  });

  return (
    <Provider>
      <Route path={AppChromeRoute.path}>
        <div className={classes.container}>
          <VacancySummary
            vacancySummaryDetails={
              TestCases.multipleDaysSplitVacancyWithSingleAssignment
            }
            setNotesForSubstitute={() => {}}
            onAssignClick={async () => {}}
            onCancelAssignment={async () => {}}
          />
        </div>
      </Route>
    </Provider>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: theme.typography.pxToRem(500),
    width: "100%",
  },
}));
