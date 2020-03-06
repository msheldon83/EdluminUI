import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { format } from "date-fns";

type Props = {
  logDetail: {
    title?: string | null;
    subTitle?: string | null;
    actingUser: string;
    actualUser: string;
    createdUtc: string;
    moreDetail: boolean;
  };
};

export const LogDetail: React.FC<Props> = props => {
  const classes = useStyles();

  const logDetail = props.logDetail;

  const byLabel =
    logDetail.actualUser === logDetail.actingUser
      ? logDetail.actualUser
      : `${logDetail.actualUser} on behalf of ${logDetail.actingUser}`;

  return (
    <div className={classes.detailContainer}>
      <div>{logDetail.title}</div>
      <div>{logDetail.subTitle}</div>
      <div>{`by ${byLabel} at ${format(
        new Date(logDetail.createdUtc),
        "MMM d, h:mm:ss a"
      )}`}</div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  detailContainer: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderRadius: theme.typography.pxToRem(4),
    width: "300px",
  },
}));
