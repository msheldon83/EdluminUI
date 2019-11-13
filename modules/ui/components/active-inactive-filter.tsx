import * as React from "react";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useQueryParamIso } from "../../hooks/query-params";
import { FilterQueryParams } from "../pages/people/people-filters/filter-params";

type Props = {
  onChange: (active: boolean | undefined) => void;
};

export const ActiveInactiveFilter = (props: Props) => {
  const { onChange } = props;

  const { t } = useTranslation();
  const classes = useStyles();

  const [isoFilters, updateIsoFilters] = useQueryParamIso(FilterQueryParams);

  React.useEffect(() => onChange(isoFilters.active), [isoFilters.active]);

  const updateActiveFilter = React.useCallback(
    (a: boolean) => () => {
      let active: boolean | undefined = a;
      if (isoFilters.active === undefined) {
        active = !a;
      } else if (isoFilters.active === a || isoFilters.active !== undefined) {
        active = undefined;
      }

      updateIsoFilters({ active });
    },
    [updateIsoFilters, isoFilters, onChange]
  );

  return (
    <>
      <InputLabel className={classes.label}>{t("Status")}</InputLabel>
      <Grid item container>
        <FormControlLabel
          control={
            <Checkbox
              checked={
                isoFilters.active === true || isoFilters.active === undefined
              }
              onChange={updateActiveFilter(true)}
            />
          }
          label={t("Active")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={
                isoFilters.active === false || isoFilters.active === undefined
              }
              onChange={updateActiveFilter(false)}
            />
          }
          label={t("Inactive")}
        />
      </Grid>
    </>
  );
};

const useStyles = makeStyles({
  label: {
    fontWeight: 500,
  },
});
