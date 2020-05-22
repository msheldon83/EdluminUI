import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { NumberInput } from "./number-input";

export const NumberInputStory = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<number | undefined>();

  return (
    <div className={classes.container}>
      <NumberInput value={value} onChange={setValue} />
    </div>
  );
};

NumberInputStory.story = {
  name: "Number Input",
};

const useStyles = makeStyles(theme => ({
  container: {
    background: "#fff",
    padding: theme.spacing(2),
    maxWidth: theme.typography.pxToRem(400),
    width: "100%",
  },
}));
