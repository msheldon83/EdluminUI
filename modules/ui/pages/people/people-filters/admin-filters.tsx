import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { FilterQueryParams, AdminQueryFilters } from "./filter-params";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { OrgRelationshipSelect } from "ui/components/reference-selects/org-relationship-select";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";

type Props = {
  positionTypeLabel: string;
  locationLabel: string;
} & AdminQueryFilters;

export const AdminFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const orgRelationships = useOrganizationRelationships(params.organizationId);

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
      <Grid item xs={3}>
        <PositionTypeSelect
          orgId={params.organizationId}
          label={props.positionTypeLabel}
          selectedPositionTypeIds={props.positionTypes}
          setSelectedPositionTypeIds={onChangePositionTypes}
        />
      </Grid>
      <Grid item xs={3}>
        <LocationSelect
          orgId={params.organizationId}
          label={props.locationLabel}
          selectedLocationIds={props.locations}
          setSelectedLocationIds={onChangeLocations}
        />
      </Grid>
      {orgRelationships.length > 1 && (
        <Grid item xs={3}>
          <OrgRelationshipSelect
            orgId={params.organizationId}
            selectedOrgId={props.shadowOrgIds[0]}
            setSelectedOrgId={onChangeSubSource}
            label={t("Source organization")}
          />
        </Grid>
      )}
    </>
  );
};
