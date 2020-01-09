import { Grid, InputLabel } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEndorsements } from "reference-data/endorsements";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import {
  FilterQueryParams,
  ReplacementEmployeeQueryFilters,
} from "./filter-params";
import { useFilterStyles } from "./filters-by-role";

type Props = ReplacementEmployeeQueryFilters;

export const ReplacementEmployeeFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useFilterStyles();
  const params = useRouteParams(PeopleRoute);

  const endorsements = useEndorsements(params.organizationId);
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  const endorsementOptions: OptionType[] = useMemo(
    () => endorsements.map(e => ({ label: e.name, value: e.id })),
    [endorsements]
  );

  const onChange = useCallback(
    (value /* OptionType[] */) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ endorsements: ids });
    },
    [updateFilters]
  );

  return (
    <Grid item md={3}>
      <InputLabel className={classes.label}>{t("Attributes")}</InputLabel>
      <SelectNew
        onChange={onChange}
        options={endorsementOptions}
        value={endorsementOptions.filter(
          e => e.value && props.endorsements.includes(Number(e.value))
        )}
        multiple
      />
    </Grid>
  );
};
