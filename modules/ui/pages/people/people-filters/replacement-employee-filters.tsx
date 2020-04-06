import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEndorsements } from "reference-data/endorsements";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import {
  FilterQueryParams,
  ReplacementEmployeeQueryFilters,
} from "./filter-params";
import { useFilterStyles } from "./filters-by-role";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { SubSourceSelect } from "ui/components/reference-selects/sub-source-select";

type Props = ReplacementEmployeeQueryFilters;

export const ReplacementEmployeeFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useFilterStyles();
  const params = useRouteParams(PeopleRoute);

  const subSources = useOrganizationRelationships(params.organizationId);

  const endorsements = useEndorsements(params.organizationId);
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const endorsementOptions: OptionType[] = useMemo(
    () => endorsements.map(e => ({ label: e.name, value: e.id })),
    [endorsements]
  );

  const onChange = useCallback(
    (value /* OptionType[] */) => {
      const ids: string[] = value ? value.map((v: OptionType) => v.value) : [];
      updateFilters({ endorsements: ids });
    },
    [updateFilters]
  );

  const onChangeSubSource = (shadowOrgId?: string | null) => {
    updateFilters({ shadowOrgIds: shadowOrgId ? [shadowOrgId] : [] });
  };

  return (
    <>
      <Grid item md={3}>
        <InputLabel className={classes.label}>{t("Attributes")}</InputLabel>
        <SelectNew
          onChange={onChange}
          options={endorsementOptions}
          value={endorsementOptions.filter(
            e => e.value && props.endorsements.includes(e.value.toString())
          )}
          multiple
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
