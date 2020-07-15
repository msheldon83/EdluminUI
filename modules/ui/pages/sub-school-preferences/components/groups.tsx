import * as React from "react";
import { Button, Grid, Link, Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { District, SchoolGroup, School } from "../types";

type RowProps = {
  name: JSX.Element;
  className: string;
  links: JSX.Element;
};

const Row: React.FC<RowProps> = ({ name, className, links }) => (
  <Grid
    item
    container
    justify="space-between"
    className={className}
    alignItems="center"
  >
    <Typography>{name}</Typography>
    {links}
  </Grid>
);

type GenericGroupProps = {
  group: SchoolGroup;
  headerLinks: JSX.Element;
  renderRowLinks: (school: School) => JSX.Element;
};

const GenericGroup: React.FC<GenericGroupProps> = ({
  group,
  headerLinks,
  renderRowLinks,
}) => {
  const classes = useStyles();
  return (
    <Grid container direction="column" className={classes.group}>
      <Row
        className={classes.header}
        name={<Typography variant="h6">{group.name}</Typography>}
        links={headerLinks}
      />
      {group.schools.map((s, i) => (
        <Row
          key={s.id}
          className={i % 2 ? classes.oddRow : classes.evenRow}
          name={<Typography>{s.name}</Typography>}
          links={renderRowLinks(s)}
        />
      ))}
    </Grid>
  );
};

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
}) => (
  <GenericGroup
    group={group}
    headerLinks={
      <Link onClick={() => setGroupToDefault(group.id)}>{allActionName}</Link>
    }
    renderRowLinks={school => (
      <Link onClick={() => setSchoolToDefault(school.id)}>{actionName}</Link>
    )}
  />
);

export type EditGroupProps = {
  group: SchoolGroup;
  onSet: (status: "favorite" | "hidden") => (schoolId: string) => void;
  onSetAll: (status: "favorite" | "hidden") => void;
  onDelete: (schoolId: string) => void;
  onDeleteAll: () => void;
};

export const EditGroup: React.FC<EditGroupProps> = ({
  group,
  onSet,
  onSetAll,
  onDelete,
  onDeleteAll,
}) => {
  const { t } = useTranslation();

  return (
    <GenericGroup
      group={group}
      headerLinks={
        <Grid item container>
          <Typography>{t("Mark all as")}</Typography>
          <Link onClick={() => onSetAll("favorite")}>{t("Favorite")}</Link>
          <Link onClick={() => onDeleteAll()}>{t("Default")}</Link>
          <Link onClick={() => onSetAll("hidden")}>{t("Hide")}</Link>
        </Grid>
      }
      renderRowLinks={({ id, status }) => (
        <Grid item container>
          {status == "favorite" ? (
            <Typography>{t("Favorite")}</Typography>
          ) : (
            <Link onClick={() => onSet("favorite")(id)}>{t("Favorite")}</Link>
          )}
          {status == "default" ? (
            <Typography>{t("Default")}</Typography>
          ) : (
            <Link onClick={() => onDelete(id)}>{t("Default")}</Link>
          )}
          {status == "hidden" ? (
            <Typography>{t("Hide")}</Typography>
          ) : (
            <Link onClick={() => onSet("hidden")(id)}>{t("Hide")}</Link>
          )}
        </Grid>
      )}
    />
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    backgroundColor: theme.customColors.lightSlate,
    padding: theme.spacing(1.5),
  },
  oddRow: {
    padding: theme.spacing(2),
  },
  evenRow: {
    padding: theme.spacing(2),
    backgroundColor: "#F8F8F8",
  },
  group: {
    paddingBottom: theme.spacing(2),
  },
}));
