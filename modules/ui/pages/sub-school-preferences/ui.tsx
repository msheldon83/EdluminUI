import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { Lens } from "@atomic-object/lenses";
import { District, SchoolGroup, School } from "./types";
import { groupBy } from "lodash-es";
import { dummyDistricts } from "./dummy-data";
import { ViewGroup } from "./components/groups";

type Grouped<Element> = {
  favorites: Element[];
  hidden: Element[];
};

type Grouping<Element> = (elements: Element[]) => Grouped<Element>;

function liftGrouping<Inner, Outer>(
  lens: Lens<Outer, Inner[]>,
  grouping: Grouping<Inner>
): Grouping<Outer> {
  return (outerElements: Outer[]) =>
    outerElements.reduce(
      (acc: Grouped<Outer>, o: Outer) => {
        const { favorites, hidden } = grouping(lens(o));
        if (favorites.length) {
          acc.favorites.push(lens.set(o, favorites));
        }
        if (hidden.length) {
          acc.hidden.push(lens.set(o, hidden));
        }
        return acc;
      },
      { favorites: [], hidden: [] }
    );
}

const groupDistricts = liftGrouping(
  District.schoolGroups,
  liftGrouping(SchoolGroup.schools, schools => {
    const { favorite = [], hidden = [] } = groupBy(schools, School.status);
    return { favorites: favorite, hidden };
  })
);

type Props = {
  userId: string;
};

export const SubSchoolPreferencesUI: React.FC<Props> = ({ userId }) => {
  const { t } = useTranslation();
  const { favorites, hidden } = groupDistricts(dummyDistricts);
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Grid container>
      <Grid
        item
        container
        xs={isMobile ? 12 : 6}
        direction="column"
        className={classes.column}
      >
        <Typography variant="h4">{t("Favorites")}</Typography>
        {favorites.map(d => (
          <React.Fragment key={d.id}>
            <Typography variant="h5" className={classes.districtName}>
              {d.name}
            </Typography>
            {d.schoolGroups.map(g => (
              <ViewGroup
                key={g.id}
                group={g}
                allActionName={t("Remove all")}
                actionName={t("Remove")}
                setGroupToDefault={() => {}}
                setSchoolToDefault={() => {}}
              />
            ))}
          </React.Fragment>
        ))}
      </Grid>
      <Grid
        item
        container
        xs={isMobile ? 12 : 6}
        direction="column"
        className={classes.column}
      >
        <Typography variant="h4">{t("Hidden")}</Typography>
        {hidden.map(d => (
          <React.Fragment key={d.id}>
            <Typography variant="h5" className={classes.districtName}>
              {d.name}
            </Typography>
            {d.schoolGroups.map(g => (
              <ViewGroup
                key={g.id}
                group={g}
                allActionName={t("Unhide all")}
                actionName={t("Unhide")}
                setGroupToDefault={() => {}}
                setSchoolToDefault={() => {}}
              />
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  districtName: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    "&:first-child": {
      paddingTop: theme.spacing(3),
    },
  },
  column: {
    padding: theme.spacing(3),
  },
}));
