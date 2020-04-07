import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import {
  FilterQueryParams,
  ReplacementEmployeeQueryFilters,
} from "./filter-params";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { OrgRelationshipSelect } from "ui/components/reference-selects/org-relationship-select";
import { EndorsementSelect } from "ui/components/reference-selects/endorsement-select";

type Props = ReplacementEmployeeQueryFilters;

export const ReplacementEmployeeFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);

  const orgRelationships = useOrganizationRelationships(params.organizationId);

  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const onChangeSubSource = (shadowOrgId?: string | null) => {
    updateFilters({ shadowOrgIds: shadowOrgId ? [shadowOrgId] : [] });
  };

  const onChangeEndorsements = (endorsementIds?: string[]) => {
    updateFilters({ endorsements: endorsementIds ?? [] });
  };

  return (
    <>
      <Grid item xs={3}>
        <EndorsementSelect
          orgId={params.organizationId}
          label={t("Attributes")}
          selectedEndorsementIds={props.endorsements}
          setSelectedEndorsementIds={onChangeEndorsements}
        />
      </Grid>
      {orgRelationships.length > 0 && (
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
