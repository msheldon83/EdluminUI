/* eslint-disable no-case-declarations */
import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { DateFormatter } from "helpers/date";
import { ObjectType } from "graphql/server-types.gen";
import { ViewedIcon } from "ui/app-chrome/notifications/components/viewed-icon";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";

type Props = {
  orgId: string;
  notification: Notification;
  markAsViewed: (notificationId: string) => Promise<any>;
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

export const AdminNotificationLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const notification = props.notification;

  const formattedDate = DateFormatter(notification.createdUtc, t);
  const htmlContent = HtmlContent(notification, formattedDate);

  switch (props.notification.objectTypeId) {
    case ObjectType.Absence:
      const absenceEdit = AdminEditAbsenceRoute.generate({
        organizationId: props.orgId,
        absenceId: props.notification.objectKey,
      });
      return (
        <Link
          to={absenceEdit}
          className={classes.hyperlink}
          onClick={() => {
            props.markAsViewed(notification.id);
          }}
        >
          {htmlContent}
        </Link>
      );
    case ObjectType.Vacancy:
      const vacancyEdit = AdminEditAbsenceRoute.generate({
        organizationId: props.orgId,
        absenceId: props.notification.objectKey,
      });
      return (
        <Link
          to={vacancyEdit}
          className={classes.hyperlink}
          onClick={() => {
            props.markAsViewed(notification.id);
          }}
        >
          {htmlContent}
        </Link>
      );
  }
  return <></>;
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
          <div className={classes.titleText}>{notification.title}</div>
          <div>{notification.content}</div>
          <div className={classes.dateText}>{formattedDate}</div>
        </div>
      </div>
    </>
  );
};
