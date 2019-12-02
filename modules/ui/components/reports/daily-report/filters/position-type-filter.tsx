import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { usePositionTypes } from "reference-data/position-types";
import { OptionType, Select } from "ui/components/form/select";
import { FilterQueryParams, DailyReportQueryFilters } from "./filter-params";
import { useStyles } from "./index";

type Props = {
  positionTypeLabel: string;
  orgId: string;
} & DailyReportQueryFilters;

export const PositionTypeFilter: React.FC<Props> = props => {
  const classes = useStyles();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const positionTypes = usePositionTypes(props.orgId);
  const positionTypeOptions: OptionType[] = useMemo(
    () => positionTypes.map(p => ({ label: p.name, value: p.id })),
    [positionTypes]
  );
  const onChangePositionTypes = useCallback(
    (value /* OptionType[] */) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ positionTypeIds: ids });
    },
    [updateFilters]
  );
  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <InputLabel>{props.positionTypeLabel}</InputLabel>
        <Select
          onChange={onChangePositionTypes}
          options={positionTypeOptions}
          value={positionTypeOptions.filter(
            e => e.value && props.positionTypeIds.includes(Number(e.value))
          )}
          multi
        />
      </Grid>
    </>
  );
};
