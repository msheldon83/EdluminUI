import * as React from "react";
import { Grid, Icon, makeStyles, Typography } from "@material-ui/core";
import useDimensions from "react-use-dimensions";
import { RedRoverConfetti } from "ui/components/confetti";

const PartyPopperIcon: typeof Icon = props => (
  <Icon {...props}>
    <img src={require("ui/icons/party-popper.svg")} />
  </Icon>
);

type Props = {};

export const PartyPopper: React.FC<Props> = ({ children }) => {
  const classes = useStyles();
  const [ref, { x, y, width: w, height: h }] = useDimensions();

  return (
    <Grid container direction="column" alignItems="center">
      <Grid item className={classes.popper}>
        {x && y && w && h && (
          <RedRoverConfetti
            confettiSource={{
              x: x + 0.23628 * w ?? 0,
              y: y - (1 - 0.31873) * h ?? 0,
              side1: { x: 0, y: 0 },
              side2: { x: (0.6521 - 0.23628) * w, y: (0.75669 - 0.31873) * h },
            }}
            initialVelocityX={{ min: 1, max: 10 }}
            style={{ zIndex: 202 }}
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
