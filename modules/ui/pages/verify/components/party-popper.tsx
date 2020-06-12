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
      <Grid item className={classes.cell}>
        {x && y && w && h && (
          <RedRoverConfetti
            confettiSource={{
              x: x + w / 2 ?? 0,
              y: y - h / 2 ?? 0,
              w: 0,
              h: 0,
            }}
            wind={0.1}
          />
        )}
        <div ref={ref}>
          <PartyPopperIcon />
        </div>
      </Grid>
      <Grid item className={classes.cell}>
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
  cell: {
    paddingBottom: theme.spacing(3),
  },
}));
