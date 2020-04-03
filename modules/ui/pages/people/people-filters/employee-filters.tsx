import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePositionTypes } from "reference-data/position-types";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { FilterQueryParams, EmployeeQueryFilters } from "./filter-params";
import { useFilterStyles } from "./filters-by-role";
import { LocationSelect } from "ui/components/reference-selects/location-select";

type Props = {
  positionTypeLabel: string;
  locationLabel: string;
} & EmployeeQueryFilters;

export const EmployeeFilters: React.FC<Props> = props => {
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
      const ids: string[] = value ? value.map((v: OptionType) => v.value) : [];
      updateFilters({ positionTypes: ids });
    },
    [updateFilters]
  );

  const onChangeLocations = (locationIds?: string[]) => {
    updateFilters({ locations: locationIds ?? [] });
  };

  return (
    <>
      <Grid item md={3}>
        <InputLabel className={classes.label}>
          {props.positionTypeLabel}
        </InputLabel>
        <SelectNew
          onChange={onChangePositionType}
          options={positionTypesOptions}
          value={positionTypesOptions.filter(
            e => e.value && props.positionTypes.includes(e.value.toString())
          )}
          multiple
        />
      </Grid>
      <Grid item md={3}>
        <LocationSelect
          orgId={params.organizationId}
          label={props.locationLabel}
          selectedLocationIds={props.locations}
          setSelectedLocationIds={onChangeLocations}
        />
      </Grid>
    </>
  );
};
