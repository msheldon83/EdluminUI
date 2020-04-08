import * as React from "react";
import { Notification } from "./notification";
import { ObjectType } from "graphql/server-types.gen";

export default {
  title: "App Chrome/Notification",
};

export const BasicNotificationStory = () => {
  return <Notification notification={basicNotification} />;
};

BasicNotificationStory.story = {
  name: "Basic",
};

const basicNotification = {
  id: "1001",
  title: "Basic notification",
  content:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...",
  viewed: false,
  createdUtc: "2019-10-30T15:41:32.4670481Z",
  objectTypeId: ObjectType.Absence,
  objectKey: "100107",
};
