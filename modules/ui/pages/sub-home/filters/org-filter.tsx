import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import { Select, OptionType } from "ui/components/form/select";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { compact, uniq } from "lodash-es";

type Props = {
  orgLabel: string;
} & SubHomeQueryFilters;

export const DistrictFilter: React.FC<Props> = props => {
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const myUserAccess = useMyUserAccess();

  const organizationOptions: OptionType[] = useMemo(() => {
    if (myUserAccess) {
      const mySubOrgs = compact(
        myUserAccess?.me?.user?.orgUsers?.map(ou => {
          if (ou?.isReplacementEmployee) {
            return ou.organization;
          }
        })
      );
      return mySubOrgs.map(o => ({ label: o.name, value: o.id }));
    } else {
      return [{ label: "", value: "" }];
    }
  }, [myUserAccess]);

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
