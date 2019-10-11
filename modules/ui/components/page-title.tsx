import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";

type Props = {};
/**
 * Page Title component.
 * This component exists so that, in the future, it can be extended to automatically
 * hoist the title into the mobile nav bar, on smaller screen sizes.
 * @param props
 */
export const PageTitle: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Typography className={classes.header} variant="h1">
      {props.children}
    </Typography>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
}));
