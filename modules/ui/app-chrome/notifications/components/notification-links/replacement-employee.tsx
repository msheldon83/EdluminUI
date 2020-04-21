/* eslint-disable no-case-declarations */
import { makeStyles, Divider } from "@material-ui/core";
import * as React from "react";
import { DateFormatter } from "helpers/date";
import { ObjectType } from "graphql/server-types.gen";
import { ViewedIcon } from "ui/app-chrome/notifications/components/viewed-icon";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SubSpecificAssignmentRoute } from "ui/routes/sub-specific-assignment";

type Props = {
  orgId: string;
  notification: Notification;
  markSingleNotificationAsViewed: (notificationId: string) => Promise<any>;
};

type Notification = {
  id: string;
  title?: string | null;
  content?: string | null;
  viewed: boolean;
  createdUtc: string;
  objectTypeId: ObjectType;
  objectKey: string;
};

export const ReplacementEmployeeNotificationLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const notification = props.notification;

  const formattedDate = DateFormatter(notification.createdUtc, t);
  const htmlContent = HtmlContent(notification, formattedDate);

  let route;

  const hideLink =
    (notification.content?.includes("Deleted") ||
      notification.content?.includes("Cancelled") ||
      notification.content?.includes("deleted") ||
      notification.content?.includes("cancelled")) ??
    false;

  switch (props.notification.objectTypeId) {
    case ObjectType.Absence:
      route = SubSpecificAssignmentRoute.generate({
        assignmentId: props.notification.objectKey,
      });
      break;
    case ObjectType.Vacancy:
      route = SubSpecificAssignmentRoute.generate({
        assignmentId: props.notification.objectKey,
      });
      break;
    case ObjectType.Assignment:
      route = SubSpecificAssignmentRoute.generate({
        assignmentId: props.notification.objectKey,
      });
      break;
  }
  return (
    <>
      {!hideLink && route ? (
        <Link
          to={route}
          className={classes.hyperlink}
          onClick={() => {
            const v = props.markSingleNotificationAsViewed(notification.id);
          }}
        >
          {htmlContent}
        </Link>
      ) : (
        <>
          <div>{htmlContent}</div>
        </>
      )}
      <Divider className={classes.divider} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    padding: theme.spacing(2),
    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
    },
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
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  hyperlink: {
    textDecoration: "none",
    "&:link": {
      color: theme.customColors.black,
    },
    "&:visited": {
      color: theme.customColors.black,
    },
  },
}));

const HtmlContent = (notification: Notification, formattedDate: string) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.container}>
        <ViewedIcon viewed={notification.viewed} />
        <div className={classes.textContainer}>
          {/* <div className={classes.titleText}>{notification.title}</div> */}
          <div>{notification.content}</div>
          <div className={classes.dateText}>{formattedDate}</div>
        </div>
      </div>
    </>
  );
};
