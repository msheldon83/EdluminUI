import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useOrganizations } from "reference-data/organizations";
import { OptionType, Select } from "ui/components/form/select";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { useStyles } from "./index";

type Props = {
  orgLabel: string;
} & SubHomeQueryFilters;

export const DistrictFilter: React.FC<Props> = props => {
  const classes = useStyles();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const organizations = useOrganizations();
  const organizationOptions: OptionType[] = useMemo(
    () => organizations.map(o => ({ label: o.name, value: o.id })),
    [organizations]
  );
  const onChangeOrganizations = useCallback(
    (value /* OptionType[] */) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ orgs: ids });
    },
    [updateFilters]
  );
  return (
    <>
      {organizationOptions.length > 1 && (
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <InputLabel className={classes.label}>{props.orgLabel}</InputLabel>
          <Select
            onChange={onChangeOrganizations}
            options={organizationOptions}
            value={organizationOptions.filter(
              e => e.value && props.orgs.includes(Number(e.value))
            )}
            multi
          />
        </Grid>
      )}
    </>
  );
};
