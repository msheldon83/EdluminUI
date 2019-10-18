import * as React from "react";
import { makeStyles, MenuItem, Select } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

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
  const selectClasses = useSelectedStyles();

  return (
    <Select
      disableUnderline={true}
      IconComponent={ArrowDropDownIcon}
      className={[classes.select, classes.font].join(" ")}
      value={props.selectedRole}
      classes={selectClasses}
      //onChange={handleChange}
      inputProps={{
        name: "",
        classes: {
          icon: classes.icon,
        },
        id: "age-simple",
      }}
      MenuProps={{
        getContentAnchorEl: null,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
        classes: selectClasses,
      }}
    >
      {props.roleOptions.map(role => (
        <MenuItem
          key={role}
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
    fontWeight: 500,
  },
  icon: {
    fill: theme.customColors.medLightGray,
  },
  select: {
    width: 225,
    paddingLeft: theme.spacing(4),
    color: theme.customColors.medLightGray,
    backgroundColor: theme.customColors.edluminSlate,
    "&:hover": {
      color: theme.customColors.white,
    },
  },
  menuItem: {
    margin: 0,
    padding: theme.typography.pxToRem(10),
    backgroundColor: theme.customColors.edluminLightSlate,
    color: theme.customColors.medLightGray,
    "&:hover": {
      color: theme.customColors.white,
      backgroundColor: theme.customColors.edluminLightSlate,
    },
  },
}));

const useSelectedStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.customColors.edluminSlate,
  },
  list: {
    padding: 0,
    backgroundColor: theme.customColors.edluminLightSlate,
    "&$selected": {
      backgroundColor: theme.customColors.edluminLightSlate,
    },
  },
}));
