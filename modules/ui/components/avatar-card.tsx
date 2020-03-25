import { Card, makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useIsMobile } from "hooks";
import clsx from "clsx";

type Props = { initials?: string };
export const AvatarCard: React.FC<Props> = props => {
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Card
      elevation={0}
      className={clsx({
        [classes.card]: true,
        [classes.mobileCard]: isMobile,
        [classes.desktopCard]: !isMobile,
      })}
    >
      <Typography className={classes.letters}>{props.initials}</Typography>
    </Card>
  );
};

const useStyles = makeStyles(theme => ({
  mobileCard: {
    width: theme.typography.pxToRem(90),
    height: theme.typography.pxToRem(90),
  },
  desktopCard: {
    width: theme.typography.pxToRem(190),
    height: theme.typography.pxToRem(190),
  },
  card: {
    background: theme.customColors.lightBlue,
    borderRadius: theme.typography.pxToRem(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  letters: {
    color: theme.customColors.blue,
    fontSize: theme.typography.pxToRem(48),
  },
}));
