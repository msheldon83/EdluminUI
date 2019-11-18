import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useLocations } from "reference-data/locations";
import { OptionType, Select } from "ui/components/form/select";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { useStyles } from "./index";

type Props = {
  locationLabel: string;
} & SubHomeQueryFilters;

// TODO We might need to convert this to a search box if we think the list of schools will be too large
export const SchoolFilter: React.FC<Props> = props => {
  const classes = useStyles();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const locations = useLocations();
  const locationOptions: OptionType[] = useMemo(
    () => locations.map(l => ({ label: l.name, value: l.id })),
    [locations]
  );
  const onChangeLocations = useCallback(
    (value /* OptionType[] */) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ locations: ids });
    },
    [updateFilters]
  );
  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <InputLabel className={classes.label}>{props.locationLabel}</InputLabel>
        <Select
          onChange={onChangeLocations}
          options={locationOptions}
          value={locationOptions.filter(
            e => e.value && props.locations.includes(Number(e.value))
          )}
          multi
        />
      </Grid>
    </>
  );
};
