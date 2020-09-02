import * as React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { ConnectionDirection } from "graphql/server-types.gen";
import { Section } from "ui/components/section";
import { ConnectionDirectionText } from "./connection-direction";

type AppPresetUIProps = {
  preset: { id: string; name: string; direction: ConnectionDirection };
  appName: string;
};
export const ApplicationPresetUI: React.FC<AppPresetUIProps> = ({
  preset,
  appName,
}) => {
  const classes = useStyles();

  return (
    <Section>
      <div className={classes.cardHeader}>
        <Typography variant="h5">{preset.name}</Typography>
        <div>
          <ConnectionDirectionText
            direction={preset.direction}
            appName={appName}
          />
        </div>
        <div className={classes.actions}></div>
      </div>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  cardHeader: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  actions: {
    float: "right",
  },
}));
