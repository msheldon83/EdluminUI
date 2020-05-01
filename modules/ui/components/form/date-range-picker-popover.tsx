import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Fade from "@material-ui/core/Fade";
import Popper from "@material-ui/core/Popper";

/*
TODO: This is a placeholder to get worked on after the date-range-picker is done
*/

export const DateRangePickerPopover = () => {
  const classes = useStyles();
  const buttonRef = React.useRef(document.createElement("button"));

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {} /*setShowPopover(!showPopover)*/}
      >
        Open
      </button>
      <Popper
        transition
        anchorEl={buttonRef.current}
        open={false}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onMouseDown"
                onClickAway={() => {
                  /*setShowPopover(false)*/
                }}
              >
                <Paper
                  className={classes.popoverContainer}
                  elevation={0}
                ></Paper>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  popoverContainer: {
    background: theme.customColors.white,
    boxShadow:
      "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24);",
    padding: theme.spacing(2),
    width: "700px", // TODO: need to make this work on mobile too
  },
}));
