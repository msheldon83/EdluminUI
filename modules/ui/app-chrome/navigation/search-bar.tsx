import { makeStyles } from "@material-ui/core";
import InputBase from "@material-ui/core/InputBase";
import { fade } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import * as React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  className?: string;
};

export const SearchBar: React.FC<Props> = props => {
  const classes = useStyles();
  const inputClasses = useInputStyles();
  const { t } = useTranslation();
  return (
    <div className={`${classes.search} ${props.className}`}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase
        placeholder={t("search", "Search")}
        classes={inputClasses}
        inputProps={{ "aria-label": "search" }}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  search: {
    color: theme.customColors.black,
    position: "relative",
    borderRadius: theme.typography.pxToRem(5),
    backgroundColor: fade(theme.palette.common.white, 0.15),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "auto",
    },
  },
  searchIcon: {
    color: "inherit",
    opacity: 0.7,
    width: theme.spacing(7),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const useInputStyles = makeStyles(theme => ({
  root: {
    color: "inherit",
  },
  input: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: 200,
    },
  },
}));
