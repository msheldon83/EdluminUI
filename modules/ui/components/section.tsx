import * as React from "react";
import { Paper, makeStyles, Theme } from "@material-ui/core";

type SectionProps = {
  className?: string;
  raised?: boolean;
};

export const Section: React.FC<SectionProps> = props => {
  const classes = useStyles(props);

  const { className = "", raised = false, children } = props;

  return (
    <Paper elevation={0} className={[classes.section, className].join(" ")}>
      {children}
    </Paper>
  );
};

const useStyles = makeStyles<Theme, SectionProps>(theme => ({
  section: {
    borderRadius: theme.typography.pxToRem(4),
    borderWidth: props => (props.raised ? 0 : theme.typography.pxToRem(1)),
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    boxShadow: props =>
      props.raised ? "0px 2px 3px rgba(0, 0, 0, 0.15);" : "none",
    "@media print": {
      padding: 0,
    },
  },
}));
