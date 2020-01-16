import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useOrganizations } from "reference-data/organizations";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";

type Props = {
  orgLabel: string;
} & SubHomeQueryFilters;

export const DistrictFilter: React.FC<Props> = props => {
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const organizations = useOrganizations();
  const organizationOptions: OptionType[] = useMemo(
    () => organizations.map(o => ({ label: o.name, value: o.id })),
    [organizations]
  );
  const onChangeOrganizations = useCallback(
    (value: OptionType[]) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ orgIds: ids });
    },
    [updateFilters]
  );

  const value = organizationOptions.filter(
    e => e.value && props.orgIds.includes(Number(e.value))
  );

  return (
    <>
      {organizationOptions.length > 1 && (
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <Select
            label={props.orgLabel}
            onChange={onChangeOrganizations}
            options={organizationOptions}
            value={value}
            multiple={true}
            placeholder="Search for districts"
          />
        </Grid>
      )}
    </>
  );
};
