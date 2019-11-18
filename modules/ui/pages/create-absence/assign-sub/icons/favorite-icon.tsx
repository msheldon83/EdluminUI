import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { Star } from "@material-ui/icons";

type Props = {
  isEmployeeFavorite: boolean;
  isLocationPositionTypeFavorite: boolean;
};

export const FavoriteIcon: React.FC<Props> = props => {
  const classes = useStyles();

  if (props.isEmployeeFavorite || props.isLocationPositionTypeFavorite) {
    return <Star className={classes.icon} />;
  }

  return null;
};

const useStyles = makeStyles(theme => ({
  icon: {
    color: "#9E9E9E",
  },
}));
