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
  multipleOrgs: boolean;
  markSingleNotificationAsViewed: (notificationId: string) => Promise<any>;
};

export const NotificationRoleMapper: React.FC<Props> = props => {
  const notification = props.notification;
  switch (notification.forOrgUserRole) {
    case OrgUserRole.Administrator:
      return (
        <AdminNotificationLink
          multipleOrgs={props.multipleOrgs}
          notification={notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
    case OrgUserRole.Employee:
      return (
        <EmployeeNotificationLink
          multipleOrgs={props.multipleOrgs}
          notification={notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
    case OrgUserRole.ReplacementEmployee:
      return (
        <ReplacementEmployeeNotificationLink
          multipleOrgs={props.multipleOrgs}
          notification={notification}
          markSingleNotificationAsViewed={props.markSingleNotificationAsViewed}
        />
      );
  }

  return <></>;
};
