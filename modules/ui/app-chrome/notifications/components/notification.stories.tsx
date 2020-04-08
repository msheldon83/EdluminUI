import * as React from "react";
import { Notification } from "./notification";
import { ObjectType } from "graphql/server-types.gen";
import { Divider } from "@material-ui/core";

export default {
  title: "App Chrome/Notification",
};

export const BasicNotificationStory = () => {
  return (
    <>
      {notifications.map((n, i) => {
        return (
          <>
            <Notification key={i} notification={n} />
            <Divider />
          </>
        );
      })}
    </>
  );
};

BasicNotificationStory.story = {
  name: "Basic",
};

const notifications = [
  {
    id: "1001",
    title: "Basic notification",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...",
    viewed: false,
    createdUtc: "2020-04-08T15:41:32.4670481Z",
    objectTypeId: ObjectType.Absence,
    objectKey: "100107",
  },
  {
    id: "1002",
    title: "Basic notification",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...",
    viewed: false,
    createdUtc: "2020-04-04T15:41:32.4670481Z",
    objectTypeId: ObjectType.Absence,
    objectKey: "100107",
  },
  {
    id: "1002",
    title: "Basic notification",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...",
    viewed: false,
    createdUtc: "2019-10-30T15:41:32.4670481Z",
    objectTypeId: ObjectType.Absence,
    objectKey: "100107",
  },
];
