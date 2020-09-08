import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { usePositionTypes } from "reference-data/position-types";
import { Select, OptionType } from "ui/components/form/select";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";

type Props = {
  positionTypeLabel: string;
} & SubHomeQueryFilters;

export const PositionTypeFilter: React.FC<Props> = props => {
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const positionTypes = usePositionTypes();
  const positionTypeOptions: OptionType[] = useMemo(
    () => positionTypes.map(p => ({ label: p.name, value: p.id })),
    [positionTypes]
  );
  const onChangePositionTypes = useCallback(
    (value: OptionType[]) => {
      const ids: string[] = value
        ? value.map((v: OptionType) => v.value.toString())
        : [];
      updateFilters({ positionTypeIds: ids });
    },
    [updateFilters]
  );

  const value = positionTypeOptions.filter(
    e => e.value && props.positionTypeIds.includes(e.value.toString())
  );

  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <Select
          label={props.positionTypeLabel}
          onChange={onChangePositionTypes}
          options={positionTypeOptions}
          value={value}
          multiple={true}
          placeholder="Search for position types"
        />
      </Grid>
    </>
  );
};
