import * as React from "react";
import { makeStyles, Divider, Popover } from "@material-ui/core";
import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetNotifications } from "./graphql/get-notifications.gen";
import { OrgUserRole } from "graphql/server-types.gen";
import { compact, uniqBy } from "lodash-es";
import { NotificationRoleMapper } from "ui/app-chrome/notifications/components/notification-role-mapper";
import { useTranslation } from "react-i18next";
import { useRole } from "core/role-context";
import { getOrgIdFromRoute } from "core/org-context";
import { TextButton } from "ui/components/text-button";
import { MarkSingleNotificationViewed } from "./graphql/mark-single-notification-viewed.gen";
import { MarkAllNotificationsViewed } from "./graphql/mark-all-notifications-viewed.gen";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
};

export const NotificationsUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const orgId = getOrgIdFromRoute();
  const contextRole = useRole();
  const [showAll, setShowAll] = React.useState<boolean>(false);

  const orgUserRole =
    contextRole === "admin"
      ? OrgUserRole.Administrator
      : contextRole === "employee"
      ? OrgUserRole.Employee
      : OrgUserRole.ReplacementEmployee;

  const [markSingleNoticationAsViewed] = useMutationBundle(
    MarkSingleNotificationViewed
  );

  const [markAllNotificationsAsViewed] = useMutationBundle(
    MarkAllNotificationsViewed
  );

  const markSingleAsViewed = async (notificationId: string) => {
    const response = await markSingleNoticationAsViewed({
      variables: {
        notificationId: notificationId,
      },
    });
    return props.onClose();
  };

  const markAllAsViewed = async () => {
    const notificationIds = notifications.map(e => e.id);
    const response = await markAllNotificationsAsViewed({
      variables: {
        notificationIds: notificationIds,
      },
    });
    setShowAll(false);
    return props.onClose();
  };

  const { open, anchorElement, onClose } = props;

  const [getNotifications, pagination] = usePagedQueryBundle(
    GetNotifications,
    r => r.inAppNotification?.paged?.totalCount,
    { variables: { orgId, includeViewed: true }, skip: !open }
  );

  const notifications =
    getNotifications.state === "DONE"
      ? compact(getNotifications.data.inAppNotification?.paged?.results)
      : [];

  const id = open ? "notifications-popover" : undefined;

  console.log(notifications);

  const orgIds = uniqBy(notifications, "orgId");

  const filteredNotifications = showAll
    ? notifications.filter((e: any) => e.forOrgUserRole === orgUserRole)
    : notifications.filter(
        (e: any) => e.viewed === false && e.forOrgUserRole === orgUserRole
      );

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorElement}
      onClose={onClose}
      elevation={1}
      marginThreshold={20}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: 0,
        horizontal: 285,
      }}
      PaperProps={{
        square: true,
        className:
          filteredNotifications.length === 0
            ? classes.smallPopover
            : classes.largePopover,
      }}
    >
      <div className={classes.container}>
        <div className={classes.headerText}>{t("Notifications")}</div>
        {filteredNotifications.length !== 0 && (
          <TextButton
            className={classes.markAsRead}
            onClick={() => markAllAsViewed()}
          >
            {t("Mark all as Read")}
          </TextButton>
        )}
        <Divider className={classes.divider} variant={"fullWidth"} />
        {filteredNotifications.length === 0 ? (
          <div>{t("No notifications")}</div>
        ) : (
          filteredNotifications.map((n: any, i: any) => {
            return (
              <React.Fragment key={i}>
                <NotificationRoleMapper
                  key={i}
                  notification={n}
                  markSingleNotificationAsViewed={markSingleAsViewed}
                />
              </React.Fragment>
            );
          })
        )}
      </div>

      <TextButton
        className={classes.showAllNotifications}
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? t("Hide Old Notifications") : t("Show All Notifications")}
      </TextButton>
    </Popover>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    justifyContent: "center",
    display: "block",
    width: "95%",
    overflowY: "auto",
    maxHeight: "600px",
    position: "absolute",
    top: "10px",
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  largePopover: {
    alignItems: "center",
    position: "relative",
    display: "flex",
    height: "650px",
    padding: theme.spacing(2),
    width: theme.typography.pxToRem(400),
    boxShadow:
      "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24)",
  },
  smallPopover: {
    alignItems: "center",
    position: "relative",
    display: "flex",
    height: "110px",
    padding: theme.spacing(2),
    width: theme.typography.pxToRem(400),
    boxShadow:
      "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24)",
  },
  headerText: {
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(18),
    textAlign: "center",
    display: "inline-block",
  },
  markAsRead: {
    display: "inline-block",
    float: "right",
    marginRight: "10px",
  },
  showAllNotifications: {
    position: "absolute",
    bottom: "0px",
    width: "100%",
    marginBottom: "10px",
  },
}));
