import * as React from "react";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import { CanDo } from "ui/components/auth/types";
import { ObjectType, OrgUserRole } from "graphql/server-types.gen";
import { AdminNotificationLink } from "./admin";

type Props = {
  objectTypeId: ObjectType;
  objectKey: string;
  orgUserRole: OrgUserRole;
  orgId: string;
};

export const NotificationLink: React.FC<Props> = props => {
  switch (props.orgUserRole) {
    case OrgUserRole.Administrator:
      return (
        <AdminNotificationLink
          objectTypeId={props.objectTypeId}
          objectKey={props.objectKey}
          orgId={props.orgId}
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
