import * as React from "react";
import { ObjectType, OrgUserRole } from "graphql/server-types.gen";
import { AdminNotificationLink } from "./notification-links/admin";
import { EmployeeNotificationLink } from "./notification-links/employee";
import { ReplacementEmployeeNotificationLink } from "./notification-links/replacement-employee";

type Props = {
  orgUserRole: OrgUserRole;
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
  markAsViewed: (notificationId: string) => Promise<any>;
};

export const NotificationRoleMapper: React.FC<Props> = props => {
  switch (props.orgUserRole) {
    case OrgUserRole.Administrator:
      return (
        <AdminNotificationLink
          orgId={props.orgId}
          notification={props.notification}
          markAsViewed={props.markAsViewed}
        />
      );
    case OrgUserRole.Employee:
      <EmployeeNotificationLink
        orgId={props.orgId}
        notification={props.notification}
        markAsViewed={props.markAsViewed}
      />;

      return <></>;
    case OrgUserRole.ReplacementEmployee:
      <ReplacementEmployeeNotificationLink
        orgId={props.orgId}
        notification={props.notification}
        markAsViewed={props.markAsViewed}
      />;
      return <></>;
  }

  return <></>;
};
