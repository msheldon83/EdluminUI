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
  notification: organization;
};

type organization = {
  id: string;
  title?: string | null;
  content?: string | null;
  viewed: boolean;
  createdUtc: string;
  objectTypeId: ObjectType;
  objectKey: string;
};

export const AdminNotificationLink: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const notification = props.notification;

  const formattedDate = DateFormatter(notification.createdUtc, t);

  const htmlContent = () => {
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

  switch (props.notification.objectTypeId) {
    case ObjectType.Absence:
      const absenceEdit = AdminEditAbsenceRoute.generate({
        organizationId: props.orgId,
        absenceId: props.notification.objectKey,
      });
      return (
        <>
          <a href={absenceEdit}>{htmlContent}</a>
        </>
      );
    case ObjectType.Vacancy:
      const vacancyEdit = AdminEditAbsenceRoute.generate({
        organizationId: props.orgId,
        absenceId: props.notification.objectKey,
      });
      return (
        <>
          <a href={vacancyEdit}>{htmlContent}</a>
        </>
      );
  }
  return <></>;
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
