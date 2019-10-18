import { Card, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";

type Props = { initials?: string };
export const AvatarCard: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Card elevation={0} className={classes.card}>
      <Typography className={classes.letters}>{props.initials}</Typography>
    </Card>
  );
};

const useStyles = makeStyles(theme => ({
  card: {
    width: theme.typography.pxToRem(175),
    height: theme.typography.pxToRem(175),
    background: theme.customColors.lightBlue,
    borderRadius: theme.typography.pxToRem(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  letters: {
    color: theme.customColors.blue,
    fontSize: theme.typography.pxToRem(24),
  },
}));
