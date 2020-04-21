/* eslint-disable no-case-declarations */
import { makeStyles, Divider } from "@material-ui/core";
import * as React from "react";
import { Can } from "ui/components/auth/can";
import { DateFormatter } from "helpers/date";
import { ObjectType } from "graphql/server-types.gen";
import { ViewedIcon } from "ui/app-chrome/notifications/components/viewed-icon";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PermissionEnum } from "graphql/server-types.gen";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { VacancyViewRoute } from "ui/routes/vacancy";

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

export const AdminNotificationLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const notification = props.notification;

  let route;
  const formattedDate = DateFormatter(notification.createdUtc, t);
  const htmlContent = HtmlContent(notification, formattedDate);

  switch (props.notification.objectTypeId) {
    case ObjectType.Absence:
      route = AdminEditAbsenceRoute.generate({
        organizationId: props.orgId,
        absenceId: props.notification.objectKey,
      });
      break;
    case ObjectType.Vacancy:
      route = VacancyViewRoute.generate({
        organizationId: props.orgId,
        vacancyId: props.notification.objectKey,
      });
      break;
  }
  return (
    <>
      {route ? (
        <Can do={[PermissionEnum.AbsVacView]}>
          <Link
            to={route}
            className={classes.hyperlink}
            onClick={() => {
              props.markSingleNotificationAsViewed(notification.id);
            }}
          >
            {htmlContent}
          </Link>
        </Can>
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
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
