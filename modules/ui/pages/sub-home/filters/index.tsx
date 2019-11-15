import { Grid, makeStyles, Paper } from "@material-ui/core";
import { useDeferredState } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { SchoolFilter } from "./school-filter";
import { DistrictFilter } from "./org-filter";
import { PositionTypeFilter } from "./position-type-filter";

type Props = { className?: string };

export const Filters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);

  return (
    <Grid container justify="space-between">
      <SchoolFilter {...filters} locationLabel={t("Schools")} />
      <DistrictFilter {...filters} orgLabel={t("Districts")} />
      <PositionTypeFilter {...filters} positionTypeLabel={t("Position type")} />
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
}));
