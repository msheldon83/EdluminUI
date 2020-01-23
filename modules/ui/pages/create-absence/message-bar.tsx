import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  message: string | null;
};

export const MessageBar: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  //Display none if message is null, else normal styling.

  return (
    <>
      <div className={classes.displayNone}>
        <Grid container>
          <Grid item xs={12}>
            {props.message}
          </Grid>
        </Grid>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  //Styles
  displayNone: {
    display: "none",
  },
}));
