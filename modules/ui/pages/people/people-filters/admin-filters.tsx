import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { FilterQueryParams, AdminQueryFilters } from "./filter-params";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { SubSourceSelect } from "ui/components/reference-selects/sub-source-select";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";

type Props = {
  positionTypeLabel: string;
  locationLabel: string;
} & AdminQueryFilters;

export const AdminFilters: React.FC<Props> = props => {
  const params = useRouteParams(PeopleRoute);
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const subSources = useOrganizationRelationships(params.organizationId);

  const onChangePositionTypes = (positionTypeIds?: string[]) => {
    updateFilters({ positionTypes: positionTypeIds ?? [] });
  };

  const onChangeLocations = (locationIds?: string[]) => {
    updateFilters({ locations: locationIds ?? [] });
  };

  const onChangeSubSource = (shadowOrgId?: string | null) => {
    updateFilters({ shadowOrgIds: shadowOrgId ? [shadowOrgId] : [] });
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
      {subSources.length > 1 && (
        <Grid item md={3}>
          <SubSourceSelect
            orgId={params.organizationId}
            selectedSubSource={props.shadowOrgIds[0]}
            setSelectedSubSource={onChangeSubSource}
          />
        </Grid>
      )}
    </>
  );
};
