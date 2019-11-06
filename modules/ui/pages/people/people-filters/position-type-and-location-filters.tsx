import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocations } from "reference-data/locations";
import { usePositionTypes } from "reference-data/position-types";
import { OptionType, Select } from "ui/components/form/select";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import {
  FilterQueryParams,
  PositionTypesAndLocationsQueryFilters,
} from "./filter-params";
import { useFilterStyles } from "./filters-by-role";

type Props = {
  positionTypeLabel: string;
  locationLabel: string;
} & PositionTypesAndLocationsQueryFilters;

export const PositionTypeAndLocationFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useFilterStyles();
  const params = useRouteParams(PeopleRoute);
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const positionTypes = usePositionTypes(params.organizationId);
  const positionTypesOptions: OptionType[] = useMemo(
    () => positionTypes.map(p => ({ label: p.name, value: p.id })),
    [positionTypes]
  );

  const onChangePositionType = useCallback(
    (value /* OptionType[] */) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ positionTypes: ids });
    },
    [updateFilters]
  );

  const locations = useLocations(params.organizationId);
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
      <Grid item md={3}>
        <InputLabel className={classes.label}>
          {props.positionTypeLabel}
        </InputLabel>
        <Select
          onChange={onChangePositionType}
          options={positionTypesOptions}
          value={positionTypesOptions.filter(
            e => e.value && props.positionTypes.includes(Number(e.value))
          )}
          multi
        />
      </Grid>
      <Grid item md={3}>
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
