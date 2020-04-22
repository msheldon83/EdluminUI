import * as React from "react";
import { ObjectType, OrgUserRole } from "graphql/server-types.gen";
import { AdminNotificationLink } from "./notification-links/admin";
import { EmployeeNotificationLink } from "./notification-links/employee";
import { ReplacementEmployeeNotificationLink } from "./notification-links/replacement-employee";

type Props = {
  notification: {
    id: string;
    title?: string | null;
    content?: string | null;
    viewed: boolean;
    createdUtc: string;
    objectTypeId: ObjectType;
    objectKey: string;
    isLinkable: boolean;
    orgId: string;
    forOrgUserRole: OrgUserRole;
    organization: {
      name: string;
    };
  };
  markSingleNotificationAsViewed: (notificationId: string) => Promise<any>;
};

export const NotificationRoleMapper: React.FC<Props> = props => {
  const n = props.notification;
  switch (n.forOrgUserRole) {
    case OrgUserRole.Administrator:
      return (
        <AdminNotificationLink
          notification={props.notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
    case OrgUserRole.Employee:
      return (
        <EmployeeNotificationLink
          notification={props.notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
    case OrgUserRole.ReplacementEmployee:
      return (
        <ReplacementEmployeeNotificationLink
          notification={props.notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
  }

  return <></>;
};
