import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Fade from "@material-ui/core/Fade";
import Popper from "@material-ui/core/Popper";
import { DateRangePicker, DateRangePickerProps } from "./date-range-picker";

type DateRangePickerPopoverProps = DateRangePickerProps & {
  rangeSummary?: string;
};

export const DateRangePickerPopover = (props: DateRangePickerPopoverProps) => {
  const classes = useStyles();
  const buttonRef = React.useRef(document.createElement("button"));

  const { rangeSummary, ...dateRangePickerProps } = props;

  const [showPopover, setShowPopover] = React.useState(false);

  return (
    <>
      <Button
        variant="outlined"
        ref={buttonRef}
        onClick={() => setShowPopover(true)}
      >
        {rangeSummary || "Select range"}
      </Button>
      <Popper
        transition
        anchorEl={buttonRef.current}
        open={showPopover}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onMouseDown"
                onClickAway={() => {
                  if (showPopover) {
                    setShowPopover(false);
                  }
                }}
              >
                <Paper className={classes.popoverContainer} elevation={0}>
                  <DateRangePicker {...dateRangePickerProps}></DateRangePicker>
                </Paper>
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
