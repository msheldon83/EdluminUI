import * as React from "react";
import { Button, Grid, Link, Typography, makeStyles } from "@material-ui/core";
import { useIsMobile } from "hooks";
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
    {name}
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
  onSet: (schoolId: string, preference: "favorite" | "hidden") => void;
  onSetAll: (preference: "favorite" | "hidden") => void;
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
  const classes = useEditStyles();
  const isMobile = useIsMobile();

  return (
    <GenericGroup
      group={group}
      headerLinks={
        <Grid item container xs={6} justify="flex-end">
          {!isMobile && (
            <Typography className={classes.text}>{t("Mark all as")}</Typography>
          )}
          <Link
            className={classes.headerLink}
            onClick={() => onSetAll("favorite")}
          >
            {t("Favorite")}
          </Link>
          <Link className={classes.headerLink} onClick={() => onDeleteAll()}>
            {t("Default")}
          </Link>
          <Link
            className={classes.headerLink}
            onClick={() => onSetAll("hidden")}
          >
            {t("Hide")}
          </Link>
        </Grid>
      }
      renderRowLinks={({ id, preference }) => (
        <Grid item container xs={6} justify="flex-end">
          {preference == "favorite" ? (
            <Typography className={classes.text}>{t("Favorite")}</Typography>
          ) : (
            <Link
              className={classes.bodyLink}
              onClick={() => onSet(id, "favorite")}
            >
              {t("Favorite")}
            </Link>
          )}
          {preference == "default" ? (
            <Typography className={classes.text}>{t("Default")}</Typography>
          ) : (
            <Link className={classes.bodyLink} onClick={() => onDelete(id)}>
              {t("Default")}
            </Link>
          )}
          {preference == "hidden" ? (
            <Typography className={classes.text}>{t("Hide")}</Typography>
          ) : (
            <Link
              className={classes.bodyLink}
              onClick={() => onSet(id, "hidden")}
            >
              {t("Hide")}
            </Link>
          )}
        </Grid>
      )}
    />
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    backgroundColor: theme.customColors.lightSlate,
    padding: `${theme.spacing(1.5)}px ${theme.spacing(2)}px`,
    border: "1px solid #E5E5E5",
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
}));

const useEditStyles = makeStyles(theme => ({
  headerLink: {
    padding: theme.spacing(1),
  },
  text: {
    padding: theme.spacing(1),
  },
  bodyLink: {
    color: "#9E9E9E",
    padding: theme.spacing(1),
  },
}));
