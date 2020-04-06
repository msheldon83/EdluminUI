import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { FilterQueryParams, EmployeeQueryFilters } from "./filter-params";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";

type Props = {
  positionTypeLabel: string;
  locationLabel: string;
} & EmployeeQueryFilters;

export const EmployeeFilters: React.FC<Props> = props => {
  const params = useRouteParams(PeopleRoute);
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const onChangeLocations = (locationIds?: string[]) => {
    updateFilters({ locations: locationIds ?? [] });
  };

  const onChangePositionTypes = (positionTypeIds?: string[]) => {
    updateFilters({ positionTypes: positionTypeIds ?? [] });
  };

  return (
    <>
      <Grid item md={3}>
        <PositionTypeSelect
          orgId={params.organizationId}
          label={props.positionTypeLabel}
          selectedPositionTypeIds={props.positionTypes}
          setSelectedPositionTypeIds={onChangePositionTypes}
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
