import { Grid } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Select, OptionType } from "ui/components/form/select";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";

type Props = {
  timeLabel: string;
} & SubHomeQueryFilters;

export const TimeFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
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
    (value: OptionType[]) => {
      const ids: string[] = value
        ? value.map((v: OptionType) => String(v.value))
        : [];
      updateFilters({ times: ids });
    },
    [updateFilters]
  );

  const value = timeOptions.filter(
    e => e.value && props.times.includes(String(e.value))
  );

  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <Select
          label={props.timeLabel}
          onChange={onChangeTimes}
          value={value}
          options={timeOptions}
          multiple={true}
          placeholder="Search for times"
        />
      </Grid>
    </>
  );
};
