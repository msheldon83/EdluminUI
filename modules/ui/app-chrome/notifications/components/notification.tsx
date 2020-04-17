import * as React from "react";
import { useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import { ObjectType, OrgUserRole } from "graphql/server-types.gen";
import {
  format,
  formatDistance,
  addDays,
  startOfDay,
  formatRelative,
  isEqual,
} from "date-fns";
import { ViewedIcon } from "./viewed-icon";
import { NotificationLink } from "ui/app-chrome/notifications/notification-links/index";
import { useTranslation } from "react-i18next";

type Props = {
  notification: {
    id: string;
    title?: string | null;
    content?: string | null;
    viewed: boolean;
    createdUtc: string;
    objectTypeId: ObjectType;
    objectKey: string;
  };
  orgId: string;
  orgUserRole: OrgUserRole;
};

export const Notification: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const notification = props.notification;

  const formattedDate = useMemo(() => {
    const now = new Date();
    const notificationDate = new Date(notification.createdUtc);

    if (isEqual(startOfDay(now), startOfDay(notificationDate))) {
      return `${formatDistance(notificationDate, now)} ${t("ago")}`;
    } else if (startOfDay(notificationDate) > addDays(startOfDay(now), -6)) {
      return formatRelative(notificationDate, now);
    } else {
      return format(notificationDate, "MMM d, yyyy");
    }
  }, [notification.createdUtc, t]);

  return (
    <>
      <NotificationLink
        objectKey={notification.objectKey}
        objectTypeId={notification.objectTypeId}
        orgUserRole={props.orgUserRole}
        orgId={props.orgId}
      >
        <div className={classes.container}>
          <ViewedIcon viewed={notification.viewed} />
          <div className={classes.textContainer}>
            <div className={classes.titleText}>{notification.title}</div>
            <div>{notification.content}</div>
            <div className={classes.dateText}>{formattedDate}</div>
          </div>
        </div>
      </NotificationLink>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    padding: theme.spacing(2),
  },
  textContainer: {
    paddingLeft: theme.spacing(2),
  },
  titleText: {
    fontWeight: 600,
  },
  dateText: {
    color: theme.customColors.medLightGray,
  },
}));
