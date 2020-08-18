import * as React from "react";
import { Grid, Link, Typography, makeStyles } from "@material-ui/core";
import { SchoolGroup } from "ui/components/substitutes/preferences/types";

export type ViewGroupProps = {
  group: SchoolGroup;
  allActionName: string;
  actionName: string;
  setGroupToDefault: (groupId: string) => void;
  setSchoolToDefault: (schoolId: string) => void;
};

export const ViewGroup: React.FC<ViewGroupProps> = ({
  group,
  allActionName,
  actionName,
  setGroupToDefault,
  setSchoolToDefault,
}) => {
  const classes = useStyles();
  return (
    <Grid container direction="column" className={classes.group}>
      <Grid
        item
        container
        justify="space-between"
        className={classes.header}
        alignItems="center"
      >
        <Typography className={classes.headerText}>{group.name}</Typography>
        <Link
          onClick={() => setGroupToDefault(group.id)}
          className={classes.headerLink}
        >
          {allActionName}
        </Link>
      </Grid>
      {group.schools.map((school, i) => (
        <Grid
          item
          container
          justify="space-between"
          className={i % 2 ? classes.oddRow : classes.evenRow}
          alignItems="center"
          key={school.id}
        >
          <Typography>{school.name}</Typography>
          <Link
            onClick={() => setSchoolToDefault(school.id)}
            className={classes.bodyLink}
          >
            {actionName}
          </Link>
        </Grid>
      ))}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    backgroundColor: theme.customColors.lightSlate,
    padding: `${theme.spacing(1.5)}px ${theme.spacing(2)}px`,
    border: "1px solid #E5E5E5",
  },
  headerText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: 600,
  },
  oddRow: {
    padding: theme.spacing(2),
    backgroundColor: "#F8F8F8",
    borderBottom: "1px solid #E5E5E5",
  },
  evenRow: {
    padding: theme.spacing(2),
    borderBottom: "1px solid #E5E5E5",
  },
  group: {
    paddingBottom: theme.spacing(2),
  },
  headerLink: {
    cursor: "pointer",
  },
  bodyLink: {
    color: "#9E9E9E",
    textDecorationLine: "underline",
    cursor: "pointer",
  },
}));
