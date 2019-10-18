import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { SearchBar } from "../navigation/search-bar";

type Props = {};

export const MobileSearchBar: React.FC<Props> = props => {
  const classes = useStyles();
  return <SearchBar className={classes.mobileMenu} />;
};

const useStyles = makeStyles(theme => ({
  mobileMenu: {
    color: theme.customColors.white,
  },
}));
