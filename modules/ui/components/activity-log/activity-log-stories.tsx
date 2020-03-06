import * as React from "react";
import { ActivityLog } from "./activity-log";

export const ActivityLogStory = () => {
  return (
    <div>
      <ActivityLog logDetails={simpleLog} />
    </div>
  );
};

ActivityLogStory.story = {
  name: "Activity Log",
};

const simpleLog = [
  {
    actingUser: "David Nawn",
    actualUser: "Frank Dzedzy",
    createdUtc: "2020-02-24T21:44:28.0804964Z",
    moreDetail: true,
    title: "Vacancy created",
    subTitle: null,
  },
  {
    actingUser: "David Nawn",
    actualUser: "Frank Dzedzy",
    createdUtc: "2020-02-24T21:44:28.0805286Z",
    moreDetail: true,
    title: "Absence created",
    subTitle: null,
  },
  {
    actingUser: "Frank Dzedzy",
    actualUser: "Frank Dzedzy",
    createdUtc: "2020-03-05T15:20:50.4637929Z",
    moreDetail: true,
    title: "Vacancy assignment created",
    subTitle: null,
  },
  {
    actingUser: "Frank Dzedzy",
    actualUser: "Frank Dzedzy",
    createdUtc: "2020-03-05T15:20:50.4774091Z",
    moreDetail: true,
    title: "Vacancy assigned",
    subTitle: null,
  },
];
