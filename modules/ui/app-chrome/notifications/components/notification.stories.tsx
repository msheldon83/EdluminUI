import * as React from "react";
import { NotificationRoleMapper } from "./notification-role-mapper";
import { ObjectType, OrgUserRole } from "graphql/server-types.gen";
import { Divider } from "@material-ui/core";

export default {
  title: "App Chrome/Notification",
};

export const BasicNotificationStory = () => {
  const [
    subNotificationsAnchor,
    setSubNotificationsAnchor,
  ] = React.useState<null | HTMLElement>(null);

  const markSingleNotificationAsViewed = async (notificationId: string) => {};

  return (
    <>
      {notifications.map((n, i) => {
        return (
          <>
            <NotificationRoleMapper
              key={i}
              notification={n}
              markSingleNotificationAsViewed={markSingleNotificationAsViewed}
              multipleOrgs={true}
            />
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
    isLinkable: true,
    orgId: "1111",
    forOrgUserRole: OrgUserRole.Administrator,
    organization: {
      name: "Glenbrook",
    },
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
    isLinkable: true,
    orgId: "1111",
    forOrgUserRole: OrgUserRole.Administrator,
    organization: {
      name: "Glenbrook",
    },
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
    isLinkable: true,
    orgId: "1111",
    forOrgUserRole: OrgUserRole.Administrator,
    organization: {
      name: "Glenbrook",
    },
  },
];
