import * as React from "react";
import { makeStyles, MenuItem, Select } from "@material-ui/core";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

type Props = {
  roleOptions: string[];
  selectedRole: string;
  expanded: boolean;
};

type RoleProps = {
  title: string;
  route: string;
  onClick: string;
};

export const RoleSwitcherUI: React.FC<Props> = props => {
  const classes = useStyles();
  const selectClasses = useSelectedStyles();

  const icon = props.expanded ? ArrowDropDownIcon : AccountBoxIcon;

  if (!props.expanded)
    return <AccountBoxIcon className={classes.iconNotExpanded} />;

  return (
    <Select
      disableUnderline={true}
      IconComponent={icon}
      className={[classes.select, classes.font].join(" ")}
      value={props.selectedRole}
      classes={selectClasses}
      //onChange={handleChange}
      inputProps={{
        name: "",
        classes: {
          icon: classes.iconExpanded,
        },
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
  iconExpanded: {
    fill: theme.customColors.medLightGray,
    marginRight: theme.typography.pxToRem(15),
  },
  iconNotExpanded: {
    color: theme.customColors.medLightGray,
    marginLeft: theme.typography.pxToRem(24),
  },
  select: {
    width: theme.typography.pxToRem(225),
    marginLeft: theme.typography.pxToRem(24),
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
    color: theme.customColors.white,
  },
  list: {
    padding: 0,
    backgroundColor: theme.customColors.edluminLightSlate,
    "&$selected": {
      backgroundColor: theme.customColors.edluminLightSlate,
      color: theme.customColors.white,
    },
  },
}));
