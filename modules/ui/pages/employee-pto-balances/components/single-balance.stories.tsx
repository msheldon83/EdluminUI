import * as React from "react";
import { SingleBalance } from "./single-balance";
import { makeStyles } from "@material-ui/core/styles";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";

export default {
  title: "Pages/Employee/RemainingBalances",
};

export const BalanceRemainingStory = () => {
  const classes = useStyles();
  const balance = remainingBalance;
  return (
    <div className={classes.container}>
      <SingleBalance
        name={balance.name}
        initialBalance={balance.initialBalance}
        usedBalance={balance.usedBalance}
        plannedBalance={balance.plannedBalance}
        remainingBalance={balance.remainingBalance}
        trackingType={balance.trackingType}
        shadeRow={false}
      />
    </div>
  );
};
BalanceRemainingStory.story = {
  name: "Balance Remaining",
};

export const PlannedOnlyStory = () => {
  const classes = useStyles();
  const balance = plannedOnly;
  return (
    <div className={classes.container}>
      <SingleBalance
        name={balance.name}
        initialBalance={balance.initialBalance}
        usedBalance={balance.usedBalance}
        plannedBalance={balance.plannedBalance}
        remainingBalance={balance.remainingBalance}
        trackingType={balance.trackingType}
        shadeRow={false}
      />
    </div>
  );
};
PlannedOnlyStory.story = {
  name: "Planned only",
};

export const NegativeBalanceStory = () => {
  const classes = useStyles();
  const balance = negativeBalance;
  return (
    <div className={classes.container}>
      <SingleBalance
        name={balance.name}
        initialBalance={balance.initialBalance}
        usedBalance={balance.usedBalance}
        plannedBalance={balance.plannedBalance}
        remainingBalance={balance.remainingBalance}
        trackingType={balance.trackingType}
        shadeRow={false}
      />
    </div>
  );
};
NegativeBalanceStory.story = {
  name: "Negative Balance",
};

export const NegativePlannedOnlyStory = () => {
  const classes = useStyles();
  const balance = negativePlannedOnly;
  return (
    <div className={classes.container}>
      <SingleBalance
        name={balance.name}
        initialBalance={balance.initialBalance}
        usedBalance={balance.usedBalance}
        plannedBalance={balance.plannedBalance}
        remainingBalance={balance.remainingBalance}
        trackingType={balance.trackingType}
        shadeRow={false}
      />
    </div>
  );
};
NegativePlannedOnlyStory.story = {
  name: "Negative Planned Only",
};

export const MaxedBalanceStory = () => {
  const classes = useStyles();
  const balance = maxBalance;
  return (
    <div className={classes.container}>
      <SingleBalance
        name={balance.name}
        initialBalance={balance.initialBalance}
        usedBalance={balance.usedBalance}
        plannedBalance={balance.plannedBalance}
        remainingBalance={balance.remainingBalance}
        trackingType={balance.trackingType}
        shadeRow={false}
      />
    </div>
  );
};
MaxedBalanceStory.story = {
  name: "Max Balance",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    width: "100%",
  },
}));

const remainingBalance = {
  name: "Personal Time",
  initialBalance: 10,
  usedBalance: 3,
  plannedBalance: 2,
  remainingBalance: 5,
  trackingType: "DAILY" as AbsenceReasonTrackingTypeId,
};

const plannedOnly = {
  name: "Personal Time",
  initialBalance: 10,
  usedBalance: 0,
  plannedBalance: 2,
  remainingBalance: 8,
  trackingType: "DAILY" as AbsenceReasonTrackingTypeId,
};

const negativeBalance = {
  name: "Personal Time",
  initialBalance: 10,
  usedBalance: 8,
  plannedBalance: 6,
  remainingBalance: -4,
  trackingType: "DAILY" as AbsenceReasonTrackingTypeId,
};

const negativePlannedOnly = {
  name: "Personal Time",
  initialBalance: 10,
  usedBalance: 0,
  plannedBalance: 12,
  remainingBalance: -2,
  trackingType: "DAILY" as AbsenceReasonTrackingTypeId,
};

const maxBalance = {
  name: "Personal Time",
  initialBalance: 10,
  usedBalance: 5,
  plannedBalance: 5,
  remainingBalance: 0,
  trackingType: "DAILY" as AbsenceReasonTrackingTypeId,
};
