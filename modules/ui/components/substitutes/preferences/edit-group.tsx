import * as React from "react";
import { Grid, Link, Typography, makeStyles } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { useTranslation } from "react-i18next";
import { SchoolGroup } from "./types";
import clsx from "clsx";
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
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Grid container direction="column" className={classes.group}>
      <Grid
        item
        container
        justify="space-between"
        className={classes.header}
        alignItems="center"
      >
        <Grid item xs={isMobile ? 4 : 6}>
          <Typography className={clsx(classes.headerText, classes.mobileName)}>
            {group.name}
          </Typography>
        </Grid>
        <Grid item container xs={isMobile ? 8 : 6} justify="flex-end">
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
      </Grid>
      {group.schools.map(({ id, name, preference }, i) => (
        <Grid
          key={id}
          item
          container
          justify="space-between"
          className={i % 2 ? classes.oddRow : classes.evenRow}
          alignItems="center"
        >
          <Grid item xs={isMobile ? 4 : 6}>
            <Typography className={isMobile ? classes.mobileName : undefined}>
              {name}
            </Typography>
          </Grid>
          <Grid item container xs={isMobile ? 8 : 6} justify="flex-end">
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
    padding: theme.spacing(1),
    cursor: "pointer",
  },
  text: {
    padding: theme.spacing(1),
  },
  bodyLink: {
    color: "#9E9E9E",
    textDecorationLine: "underline",
    cursor: "pointer",
    padding: theme.spacing(1),
  },
  mobileName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));
