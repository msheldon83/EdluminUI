import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { OptionType, Select } from "ui/components/form/select";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { useStyles } from "./index";

type Props = {
  timeLabel: string;
} & SubHomeQueryFilters;

export const TimeFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const times = [
    { id: "full", name: t("Full Day") },
    { id: "partial", name: t("Partial Day") },
    { id: "multi", name: t("Multi-day") },
  ];
  const timeOptions: OptionType[] = useMemo(
    () => times.map(t => ({ label: t.name, value: t.id })),
    [times]
  );
  const onChangeTimes = useCallback(
    (value /* OptionType[] */) => {
      const ids: string[] = value
        ? value.map((v: OptionType) => String(v.value))
        : [];
      updateFilters({ times: ids });
    },
    [updateFilters]
  );
  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <InputLabel className={classes.label}>{props.timeLabel}</InputLabel>
        <Select
          onChange={onChangeTimes}
          options={timeOptions}
          value={timeOptions.filter(
            e => e.value && props.times.includes(String(e.value))
          )}
          multi
        />
      </Grid>
    </>
  );
};
