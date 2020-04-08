import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { ObjectType } from "graphql/server-types.gen";
import { format } from "date-fns";
import { ViewedIcon } from "./viewed-icon";

type Props = {
  notification: {
    id: string;
    title?: string | null;
    content?: string | null;
    headerMessage?: string | null;
    viewed: boolean;
    createdUtc: string;
    objectTypeId: ObjectType;
    objectKey: string;
  };
};

export const Notification: React.FC<Props> = props => {
  const classes = useStyles();

  const notification = props.notification;
  const date = format(new Date(notification.createdUtc), "MMM d");

  return (
    <>
      <div className={classes.container}>
        <ViewedIcon viewed={notification.viewed} />
        <div className={classes.textContainer}>
          <div className={classes.titleText}>{notification.title}</div>
          <div>{notification.content}</div>
          <div className={classes.dateText}>{date}</div>
        </div>
      </div>
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
