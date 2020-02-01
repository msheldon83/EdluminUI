import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { useOrganizations } from "reference-data/organizations";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { compact, uniq } from "lodash-es";

type Props = {
  orgLabel: string;
} & SubHomeQueryFilters;

export const DistrictFilter: React.FC<Props> = props => {
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const userAccessQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });
  const userAccess = userAccessQuery.state !== "DONE" ? null : userAccessQuery.data.userAccess?.me;  

  const organizationOptions: OptionType[] = useMemo(
    () => {
      if (userAccess) {
        const mySubOrgs = compact(
          userAccess?.user?.orgUsers?.map(ou => {if (ou.isReplacementEmployee) {
            return ou.organization;
          }}));
        return mySubOrgs.map(o => ({ label: o.name, value: o.id }))
      } else {
        return [{ label: "", value: ""}];
      }
    },
    [userAccess]
  );

  const onChangeOrganizations = useCallback(
    (value: OptionType[]) => {
      const ids: string[] = value
        ? value.map((v: OptionType) => v.value.toString())
        : [];
      updateFilters({ orgIds: ids });
    },
    [updateFilters]
  );

  const value = organizationOptions.filter(
    e => e.value && props.orgIds.includes(e.value.toString())
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
