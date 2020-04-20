import * as React from "react";
import { makeStyles, Divider, Popover } from "@material-ui/core";
import { useMyUserAccess } from "reference-data/my-user-access";
import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetNotifications } from "./graphql/get-notifications.gen";
import { compact } from "lodash-es";
import { NotificationRoleMapper } from "ui/app-chrome/notifications/components/notification-role-mapper";
import { OrgUserRole } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { getOrgIdFromRoute } from "core/org-context";
import { MarkSingleNotificationViewed } from "./graphql/mark-single-notification-viewed.gen";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorElement: null | HTMLElement;
};

export const NotificationsUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const orgId = getOrgIdFromRoute();

  const userAccess = useMyUserAccess();
  const orgUser = userAccess?.me?.user?.orgUsers?.find(e => e?.orgId === orgId);

  const [markSingleNoticationAsViewed] = useMutationBundle(
    MarkSingleNotificationViewed,
    {}
  );

  const markAsViewed = async (notificationId: string) => {
    const response = await markSingleNoticationAsViewed({
      variables: {
        notificationId: notificationId,
      },
    });
    return props.onClose();
  };

  const orgUserRole = orgUser?.isAdmin
    ? OrgUserRole.Administrator
    : orgUser?.isEmployee
    ? OrgUserRole.Employee
    : OrgUserRole.ReplacementEmployee;

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
        className: classes.popover,
      }}
    >
      <div className={classes.container}>
        <div className={classes.headerText}>{t("Notifications")}</div>
        <Divider className={classes.divider} variant={"fullWidth"} />
        {notifications.length === 0 ? (
          <div>{t("No notifications")}</div>
        ) : (
          notifications.map((n, i) => {
            return (
              <React.Fragment key={i}>
                <NotificationRoleMapper
                  key={i}
                  notification={n}
                  orgId={orgId ?? ""}
                  orgUserRole={orgUserRole}
                  markAsViewed={markAsViewed}
                />
                <Divider className={classes.divider} />
              </React.Fragment>
            );
          })
        )}
      </div>
    </Popover>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    justifyContent: "center",
    display: "block",
    width: "100%",
    overflowY: "auto",
    maxHeight: "600px",
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  popover: {
    alignItems: "center",
    display: "flex",
    padding: theme.spacing(2),
    width: theme.typography.pxToRem(400),
    boxShadow:
      "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24)",
  },
  headerText: {
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(18),
    textAlign: "center",
  },
}));
