import * as React from "react";
import { getOrgIdFromRoute } from "core/org-context";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import { useQueryBundle } from "graphql/hooks";
import { GetUnreadNotificationCount } from "../graphql/get-unread-notification-count.gen";

type Props = {};

export const NotificationIcon: React.FC<Props> = props => {
  const orgId = getOrgIdFromRoute();

  const getUnreadNotificationCount = useQueryBundle(
    GetUnreadNotificationCount,
    {
      variables: {
        orgId,
      },
      pollInterval: 120000, // Poll every 2 minutes
    }
  );

  const unreadNotificationCount =
    getUnreadNotificationCount.state !== "LOADING"
      ? getUnreadNotificationCount.data.inAppNotification
          ?.unreadNotificationCount
      : 0;

  return unreadNotificationCount === 0 ? (
    <NotificationsNoneIcon />
  ) : (
    <NotificationsNoneIcon /> // TODO: swap this out for the icon from Figma
  );
};
