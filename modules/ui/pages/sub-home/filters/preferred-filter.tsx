import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { useTranslation } from "react-i18next";

type Props = {} & SubHomeQueryFilters;

export const PreferredFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);

  return (
    <>
      <Grid item xs={12} sm={6} md={3} lg={3}>
        <FormControlLabel
          checked={props.showNonPreferredJobs}
          control={
            <Checkbox
              onChange={e =>
                updateFilters({ showNonPreferredJobs: e.target.checked })
              }
              color="primary"
            />
          }
          label={t("Show non-preferred")}
        />
      </Grid>
    </>
  );
};
