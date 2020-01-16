import * as React from "react";
import { Grid, makeStyles, Button, ButtonGroup, ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList } from "@material-ui/core";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {
  PeopleRoute,
  AdminAddRoute,
  EmployeeAddRoute,
  SubstituteAddRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

export const CreateButton: React.FC<{}> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const history = useHistory();
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const options = [    
    t("Create an Admin"),
    t("Create an Employee"),
    t("Create a Substitute"),    
  ];

  const handleClick = () => {
    goToAddPage(selectedIndex);
  };

  const goToAddPage = (index: number) => {
    switch (index) {
      case 0:
        history.push(AdminAddRoute.generate(params));
        break;
      case 1:
        history.push(EmployeeAddRoute.generate(params));
        break;
      case 2:
        history.push(SubstituteAddRoute.generate(params));
        break;
      default:
        break;
    }
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
    //goToAddPage(index);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item xs={12}>
        <ButtonGroup
          variant="contained"
          color="primary"
          ref={anchorRef}
          aria-label="split button"
        >
          <Button onClick={handleClick}>{options[selectedIndex]}</Button>
          <Button
            color="primary"
            size="small"
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="select create person"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu" >
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        className={classes.menu}
                        selected={index === selectedIndex}
                        disabled={false}
                        onClick={event => handleMenuItemClick(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  menu: {
    zIndex: -1,
  }
}));