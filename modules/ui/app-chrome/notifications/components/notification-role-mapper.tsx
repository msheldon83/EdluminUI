import * as React from "react";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import { CanDo } from "ui/components/auth/types";
import { ObjectType, OrgUserRole } from "graphql/server-types.gen";
import { AdminNotificationLink } from "./notification-links/admin";

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
};

export const NotificationRoleMapper: React.FC<Props> = props => {
  switch (props.orgUserRole) {
    case OrgUserRole.Administrator:
      return (
        <AdminNotificationLink
          orgId={props.orgId}
          notification={props.notification}
        />
      );
    case OrgUserRole.Employee:
      //Employee Component

      return <></>;
    case OrgUserRole.ReplacementEmployee:
      return <></>;
  }

  return <></>;
};
