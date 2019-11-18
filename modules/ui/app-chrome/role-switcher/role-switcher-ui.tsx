import * as React from "react";
import { makeStyles, Select, MenuItem } from "@material-ui/core";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useHistory } from "react-router";
import { useCallback } from "react";

type Props = {
  roleOptions: { name: string; value: string }[];
  selectedRole: string;
  expanded: boolean;
};

export const RoleSwitcherUI: React.FC<Props> = props => {
  const classes = useStyles();
  const selectClasses = useSelectStyles();
  const selectMenuClasses = useSelectMenuStyles();

  const history = useHistory();
  const icon = props.expanded ? ArrowDropDownIcon : AccountBoxIcon;

  const onChange = useCallback(
    e => {
      const route = AppChromeRoute.generate({
        role: e.target.value,
      }).toLowerCase();

      history.push(route);
    },
    [history]
  );

  if (!props.expanded)
    return <AccountBoxIcon className={classes.iconNotExpanded} />;

  return (
    <Select
      disableUnderline={true}
      IconComponent={icon}
      className={[classes.select, classes.font].join(" ")}
      value={props.selectedRole}
      onChange={onChange}
      classes={selectClasses}
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
        classes: selectMenuClasses,
      }}
    >
      {props.roleOptions.map(role => (
        <MenuItem
          key={role.value}
          value={role.value}
          className={[classes.menuItem, classes.font].join(" ")}
        >
          {role.name}
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
    marginBottom: theme.typography.pxToRem(8),
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

const useSelectStyles = makeStyles(theme => ({
  selectMenu: {
    backgroundColor: theme.customColors.edluminSlate,
    color: theme.customColors.white,
  },
}));

const useSelectMenuStyles = makeStyles(theme => ({
  list: {
    padding: 0,
    backgroundColor: theme.customColors.edluminLightSlate,
    "&selected": {
      backgroundColor: theme.customColors.edluminLightSlate,
      color: theme.customColors.white,
    },
  },
}));
