import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { makeStyles } from "@material-ui/core";
import { useMyUserAccess } from "reference-data/my-user-access";
import { can } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { CanDo } from "./auth/types";

type Props = {
  options: Array<Option>;
};

export type Option = {
  name: string;
  onClick: (event: React.MouseEvent) => void;
  permissions?: CanDo;
};

export const ActionMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const userAccess = useMyUserAccess();
  const contextOrgId = useOrganizationId();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const filteredOptions = props.options.filter(o => {
    if (o.permissions) {
      return can(
        o.permissions,
        userAccess?.permissionsByOrg ?? [],
        userAccess?.isSysAdmin ?? false,
        contextOrgId ?? undefined
      );
    }
  });

  return filteredOptions.length === 0 ? (
    <></>
  ) : (
    <div>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
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
        {filteredOptions.map((option: Option, index: number) => {
          return (
            <MenuItem
              key={index}
              onClick={event => {
                option.onClick(event);
                handleClose();
              }}
            >
              {option.name}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  paper: {
    width: 200,
  },
}));
