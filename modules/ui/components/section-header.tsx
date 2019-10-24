import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";

type Props = {
  title: string;
  action: Action;
  cancel: Action;
  submit: Action;
};
type Action = {
  text: string;
  visible: boolean;
  execute: Function;
};

export const SectionHeader: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Grid container justify="space-between" alignItems="center">
      <Grid item>
        <h3>{props.title}</h3>
      </Grid>
      <Grid item>
        {props.action.visible && (
          <TextButton onClick={() => props.action.execute()}>
            {props.action.text}
          </TextButton>
        )}
        {props.cancel.visible && (
          <TextButton onClick={() => props.cancel.execute()}>
            {props.cancel.text}
          </TextButton>
        )}
        {props.submit.visible && (
          <TextButton onClick={() => props.submit.execute()}>
            {props.submit.text}
          </TextButton>
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({}));
