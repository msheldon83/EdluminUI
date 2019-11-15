import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useOrganizations } from "reference-data/organizations";
import { OptionType, Select } from "ui/components/form/select";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { useStyles } from "./index";

type Props = {
  orgLabel: string;
} & SubHomeQueryFilters;

export const DistrictFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PeopleRoute);
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const organizations = useOrganizations();
  console.log(organizations);
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
      <Grid item md={3}>
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
    </>
  );
};
