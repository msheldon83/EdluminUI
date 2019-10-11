import * as React from "react";
import { makeStyles, Card } from "@material-ui/core";

type Props = {};
export const AvatarCard: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Card elevation={0} className={classes.card}>
      meh
    </Card>
  );
};

const useStyles = makeStyles(theme => ({
  card: {
    width: theme.typography.pxToRem(175),
    height: theme.typography.pxToRem(175),
    background: theme.customColors.lightBlue,
    borderRadius: theme.typography.pxToRem(2),
  },
}));
