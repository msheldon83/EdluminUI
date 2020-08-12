import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { NumberInput } from "./number-input";

export const NumberInputStory = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState<string>();

  return (
    <div className={classes.container}>
      <NumberInput
        value={value}
        maxLengthBeforeDecimal={2}
        maxLengthAfterDecimal={2}
        onChange={e => {
          setValue(e.target.value);
        }}
      />
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
