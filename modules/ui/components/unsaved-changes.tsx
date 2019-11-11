import * as React from "react";
import { makeStyles, Button, Popover, Slide } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";

type Props = {
  open: boolean;
  anchorElement?: null | Element | ((element: Element) => Element);
  message: React.ReactNode;
  onSave: () => void;
  onDiscard: () => void;
};

export const UnsavedChanges = (props: Props) => {
  const classes = useStyles();

  const { open, anchorElement, message, onSave, onDiscard } = props;

  const id = open ? "unsaved-changes-popover" : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorElement}
      elevation={1}
      marginThreshold={0}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      PaperProps={{
        square: true,
        className: classes.popover,
      }}
      TransitionComponent={FadeTransitionWithCorrectProps}
    >
      <div className={classes.message}>{message}</div>
      <div className={classes.actions}>
        <Button
          size="small"
          className={classes.negativeButton}
          variant="outlined"
          onClick={() => onDiscard()}
        >
          Discard
        </Button>
        <Button size="small" variant="contained" onClick={() => onSave()}>
          Save
        </Button>
      </div>
    </Popover>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    height: theme.typography.pxToRem(60),
    width: "100%",
  },
  popover: {
    alignItems: "center",
    backgroundColor: theme.customColors.lightBlue,
    display: "flex",
    height: theme.typography.pxToRem(60),
    /*
      Have ot use px here bcause of how this props is coelesced by the Paper component when
      passed in as a prop
    */
    padding: `0 ${theme.spacing(3)}px`,
    maxWidth: "100%",
    width: "100%",
  },
  message: {
    flex: 1,
  },
  actions: {},
  negativeButton: {
    marginRight: theme.spacing(2),
  },
}));

/*
  There's a bug in Material-UI that defines the transitions differently. Because of
  this, their type signatures are different. TypeScript complains about using the
  Slide component as the TransitionComponent in the popover, even though it works
  just fine. This is just a workaround to that.
*/
const FadeTransitionWithCorrectProps = React.forwardRef(
  (props: TransitionProps, ref) => (
    <Slide {...props} direction="down" ref={ref} />
  )
);
