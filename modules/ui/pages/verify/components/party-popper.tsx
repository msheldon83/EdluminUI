import * as React from "react";
import { Grid, Icon, makeStyles, Typography } from "@material-ui/core";
import useDimensions from "react-use-dimensions";
import { RedRoverConfetti } from "ui/components/confetti";

const PartyPopperIcon: typeof Icon = props => (
  <Icon {...props}>
    <img src={require("ui/icons/party-popper.svg")} />
  </Icon>
);

type Props = {
  width?: number;
  height?: number;
  onConfettiComplete?: () => void;
};

export const PartyPopper: React.FC<Props> = ({
  width,
  height,
  onConfettiComplete,
  children,
}) => {
  const classes = useStyles();
  const [ref, { x, y, width: w, height: h }] = useDimensions();
  // Commented out until react-confetti can be updated
  // We want to generate points along a line,
  // so we make a function to do so.
  // This will depend on the position and
  // dimensions of the popper svg.
  /*const getLinePoint = React.useCallback((): { x: number; y: number } => {
    if (!x || !y || !w || !h) return { x: 0, y: 0 };
    // The endpoints of the line, for our particular svg, are:
    const p1 = [x + 0.23628 * w, y - 0.48127 * h];
    const p2 = [x + 0.6521 * w, y - 0.11331 * h];
    // Next, get a random number between 0 and 1
    const r = Math.random();
    // The closer r is to 0, the closer our generated point will be to p1,
    // and likewise, the closer r is to 1, the closer to p2.
    return {
      x: p1[0] * (1 - r) + p2[0] * r,
      y: p1[1] * (1 - r) + p2[1] * r,
    };
    }, [x, y, w, h]);*/

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item className={classes.popper}>
        {x && y && w && h && (
          <RedRoverConfetti
            confettiSource={{
              x: x + ((0.23628 + 0.6521) / 2) * w,
              y: y - ((0.48127 + 0.11331) / 2) * h,
              w: 0,
              h: 0,
            }}
            initialVelocityX={{ min: 1, max: 10 }}
            style={{ zIndex: 202 }}
            width={Math.max(width ?? 0, window.innerWidth)}
            height={Math.max(height ?? 0, window.innerHeight)}
            onConfettiComplete={onConfettiComplete}
          />
        )}
        <div ref={ref}>
          <PartyPopperIcon />
        </div>
      </Grid>
      <Grid item className={classes.children}>
        {typeof children === "string" ? (
          <Typography variant="h3">{children}</Typography>
        ) : (
          children
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  children: {
    width: "100%",
  },
  popper: {
    padding: theme.spacing(3),
  },
}));
