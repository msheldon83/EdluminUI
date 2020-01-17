import * as React from "react";
import { Button, ButtonGroup, Menu, MenuItem } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { makeStyles } from "@material-ui/core";
import { useMyUserAccess } from "reference-data/my-user-access";
import { can } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { CanDo } from "./auth/types";

type Props = {
  options: Array<Option>;
  selectedIndex?: number;
};

export type Option = {
  name: string;
  onClick: (event: React.MouseEvent) => void;
  permissions?: CanDo;
};

export const MenuButton: React.FC<Props> = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const userAccess = useMyUserAccess();
  const contextOrgId = useOrganizationId();
  const [selectedIndex, setSelectedIndex] = React.useState(
    props.selectedIndex ?? 0
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const filteredOptions = props.options.filter(o => {
    if (!o.permissions) {
      return true;
    }

    return can(
      o.permissions,
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      contextOrgId ?? undefined
    );
  });

  return (
    <div>
      <ButtonGroup variant="contained" color="primary">
        <Button onClick={props.options[selectedIndex].onClick}>
          {props.options[selectedIndex].name}
        </Button>
        <Button
          color="primary"
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="toggle button"
          aria-haspopup="menu"
          onClick={handleClick}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu
        anchorEl={anchorEl}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: classes.paper,
        }}
      >
        {filteredOptions.map((option: Option, index: number) => (
          <MenuItem
            key={index}
            onClick={event => {
              option.onClick(event);
              handleClose();
            }}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  paper: {
    width: 200,
  },
}));
