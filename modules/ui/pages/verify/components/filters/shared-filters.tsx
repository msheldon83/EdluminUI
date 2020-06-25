import * as React from "react";
import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { OrgRelationshipSelect } from "ui/components/reference-selects/org-relationship-select";
import { VerifyQueryFilters } from "./filter-params";

type Props = {
  orgId: string;
  setLocationIds: (ids?: string[] | undefined) => void;
  setSubSource: (id?: string | null | undefined) => void;
} & Pick<VerifyQueryFilters, "locationIds" | "subSource">;

export const SharedFilters: React.FC<Props> = ({
  orgId,
  locationIds,
  setLocationIds,
  subSource,
  setSubSource,
}) => {
  const { t } = useTranslation();
  const subSources = useOrganizationRelationships(orgId);

  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <LocationSelect
          label={t("Schools")}
          orgId={orgId}
          selectedLocationIds={locationIds}
          setSelectedLocationIds={setLocationIds}
        />
      </Grid>
      {subSources.length > 0 && (
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <OrgRelationshipSelect
            orgId={orgId}
            selectedOrgId={subSource}
            setSelectedOrgId={setSubSource}
            label={t("Sub source")}
          />
        </Grid>
      )}
    </>
  );
};
