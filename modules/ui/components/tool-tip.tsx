import * as React from "react";
import InfoIcon from "@material-ui/icons/Info";
import { makeStyles } from "@material-ui/styles";
import { Typography, Tooltip } from "@material-ui/core";

type Props = {
  message: string;
};

export const ToolTip: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Tooltip
      title={
        <div className={classes.tooltip}>
          <Typography variant="body1">{props.message}</Typography>
        </div>
      }
      placement="right-start"
    >
      <InfoIcon
        color="primary"
        style={{
          fontSize: "16px",
          marginLeft: "8px",
        }}
      />
    </Tooltip>
  );
};

const useStyles = makeStyles(theme => ({
  noteText: {
    fontWeight: "bold",
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  sectionBackground: {
    backgroundColor: theme.customColors.lightBlue,
  },
}));
