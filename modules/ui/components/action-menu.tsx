import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { makeStyles } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "./auth/can";
import { OrgUserPermissions } from "reference-data/my-user-access";

type Props = {
  options: Array<Option>;
};

export type Option = {
  name: string;
  onClick: (event: React.MouseEvent) => void;
  permissions?:
    | PermissionEnum[]
    | ((
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string
      ) => boolean);
  orgId?: string;
};

export const ActionMenu: React.FC<Props> = props => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
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
        {props.options.map((option: Option, index: number) => {
          if (option.permissions) {
            <Can do={option.permissions} orgId={option.orgId} key={index}>
              <MenuItem
                onClick={event => {
                  option.onClick(event);
                  handleClose();
                }}
              >
                {option.name}
              </MenuItem>
            </Can>;
          } else {
            <MenuItem
              key={index}
              onClick={event => {
                option.onClick(event);
                handleClose();
              }}
            >
              {option.name}
            </MenuItem>;
          }
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
