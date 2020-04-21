import * as React from "react";
import { ObjectType } from "graphql/server-types.gen";
import { AdminNotificationLink } from "./notification-links/admin";
import { EmployeeNotificationLink } from "./notification-links/employee";
import { ReplacementEmployeeNotificationLink } from "./notification-links/replacement-employee";

type Props = {
  contextRole: string | null;
  orgId: string;
  notification: {
    id: string;
    title?: string | null;
    content?: string | null;
    viewed: boolean;
    createdUtc: string;
    objectTypeId: ObjectType;
    objectKey: string;
  };
  markSingleNotificationAsViewed: (notificationId: string) => Promise<any>;
};

export const NotificationRoleMapper: React.FC<Props> = props => {
  switch (props.contextRole) {
    case "admin":
      return (
        <AdminNotificationLink
          orgId={props.orgId}
          notification={props.notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
    case "employee":
      return (
        <EmployeeNotificationLink
          orgId={props.orgId}
          notification={props.notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
    case "substitute":
      return (
        <ReplacementEmployeeNotificationLink
          orgId={props.orgId}
          notification={props.notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
  }

  return <></>;
};
