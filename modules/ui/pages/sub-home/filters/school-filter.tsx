import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useLocations } from "reference-data/locations";
import { Select, OptionType } from "ui/components/form/select";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";

type Props = {
  locationLabel: string;
} & SubHomeQueryFilters;

// TODO We might need to convert this to a search box if we think the list of schools will be too large
export const SchoolFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const locations = useLocations();
  const locationOptions: OptionType[] = useMemo(
    () => locations.map(l => ({ label: l.name, value: l.id })),
    [locations]
  );
  const onChangeLocations = useCallback(
    (value: OptionType[]) => {
      const ids: string[] = value
        ? value.map((v: OptionType) => v.value.toString())
        : [];

      updateFilters({ locationIds: ids });
    },
    [updateFilters]
  );

  const value = locationOptions.filter(
    e => e.value && props.locationIds.includes(e.value.toString())
  );

  return (
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <Select
        label={props.locationLabel}
        onChange={onChangeLocations}
        value={value}
        options={locationOptions}
        multiple={true}
        placeholder={t("Search for schools")}
      />
    </Grid>
  );
};
