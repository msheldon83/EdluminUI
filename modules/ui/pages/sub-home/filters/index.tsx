import {
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FilterQueryParams } from "./filter-params";
import { SchoolFilter } from "./school-filter";
import { DistrictFilter } from "./org-filter";
import { PositionTypeFilter } from "./position-type-filter";
import { TimeFilter } from "./time-filter";
import { PreferenceFilter } from "./preference-filter";

type Props = { userId: string; className?: string };

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [filters] = useQueryParamIso(FilterQueryParams);

  return (
    <Grid
      container
      alignItems="center"
      justify="flex-start"
      spacing={2}
      className={classes.filters}
    >
      <SchoolFilter {...filters} locationLabel={t("Schools")} />
      <DistrictFilter {...filters} orgLabel={t("Districts")} />
      {/*
      <PositionTypeFilter {...filters} positionTypeLabel={t("Position type")} />
      <TimeFilter {...filters} timeLabel={t("Time")} />
      */}
      <PreferenceFilter userId={props.userId} {...filters} />
    </Grid>
  );
};

export const useStyles = makeStyles(theme => ({
  tab: {
    textTransform: "uppercase",
  },
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(16),
  },
  textField: {
    marginTop: theme.spacing(2),
  },
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
