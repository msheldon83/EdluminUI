import * as React from "react";
import { MenuList, makeStyles, MenuItem, Select } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { withRouter } from "react-router";
import { MenuLink } from "../menu-link";
import { useTranslation } from "react-i18next";

type Props = {
  roleOptions: string[];
  selectedRole: string;
};

type RoleProps = {
  title: string;
  route: string;
  onClick: string;
};

export const RoleSwitcherUI: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Select
      MenuProps={{
        getContentAnchorEl: null,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
      }}
      className={[classes.select, classes.font].join(" ")}
      value={props.selectedRole}
      // onChange={handleChange}
      inputProps={{
        name: "",
        id: "age-simple",
      }}
    >
      {props.roleOptions.map(role => (
        <MenuItem
          className={[classes.menuItem, classes.font].join(" ")}
          value={role}
        >
          {role}
        </MenuItem>
      ))}
    </Select>
  );
};

const useStyles = makeStyles(theme => ({
  font: {
    fontFamily: "Poppins",
  },

  select: {
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    color: theme.customColors.grayWhite,
    backgroundColor: theme.customColors.edluminSlate,
  },
  menuItem: {
    padding: 10,
    backgroundColor: theme.customColors.edluminSlate,
    color: theme.customColors.grayWhite,
    "&:hover": {
      color: theme.customColors.white,
    },
  },
}));
