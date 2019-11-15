import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocations } from "reference-data/locations";
import { OptionType, Select } from "ui/components/form/select";
import { useRouteParams } from "ui/routes/definition";
import { SubHomeRoute } from "ui/routes/sub-home";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { useStyles } from "./index";

type Props = {
  timeLabel: string;
} & SubHomeQueryFilters;

export const TimeFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubHomeRoute);
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);

  const times = [{ id: "1000", name: "All" }];
  const timeOptions: OptionType[] = useMemo(
    () => times.map(t => ({ label: t.name, value: t.id })),
    [times]
  );
  const onChangeTimes = useCallback(
    (value /* OptionType[] */) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ times: ids });
    },
    [updateFilters]
  );
  return (
    <>
      <Grid item md={3}>
        <InputLabel className={classes.label}>{props.timeLabel}</InputLabel>
        <Select
          onChange={onChangeTimes}
          options={timeOptions}
          value={timeOptions.filter(
            e => e.value && props.times.includes(Number(e.value))
          )}
          multi
        />
      </Grid>
    </>
  );
};
