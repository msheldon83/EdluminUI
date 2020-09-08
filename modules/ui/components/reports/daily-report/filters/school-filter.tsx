import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useLocations } from "reference-data/locations";
import { OptionType, Select } from "ui/components/form/select";
import { FilterQueryParams, DailyReportQueryFilters } from "./filter-params";
import { useStyles } from "./index";

type Props = {
  locationLabel: string;
  orgId: string;
} & DailyReportQueryFilters;

// TODO We might need to convert this to a search box if we think the list of schools will be too large
export const SchoolFilter: React.FC<Props> = props => {
  const classes = useStyles();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const locations = useLocations(props.orgId);
  const locationOptions: OptionType[] = useMemo(
    () => locations.map(l => ({ label: l.name, value: l.id })),
    [locations]
  );
  const onChangeLocations = useCallback(
    (value /* OptionType[] */) => {
      const ids: string[] = value ? value.map((v: OptionType) => v.value) : [];
      updateFilters({ locationIds: ids });
    },
    [updateFilters]
  );
  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <Select
          label={props.locationLabel}
          onChange={onChangeLocations}
          options={locationOptions}
          value={locationOptions.filter(
            e => e.value && props.locationIds.includes(e.value.toString())
          )}
          multiple
        />
      </Grid>
    </>
  );
};
