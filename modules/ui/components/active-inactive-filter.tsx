import * as React from "react";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useQueryParamIso } from "../../hooks/query-params";
import { FilterQueryParams } from "../pages/people/people-filters/filter-params";

type Props = {
  onChange?: (active: boolean | undefined) => void;
  label: string;
  activeLabel: string;
  inactiveLabel: string;
};

export const ActiveInactiveFilter = (props: Props) => {
  const { onChange = () => {}, label, activeLabel, inactiveLabel } = props;

  const { t } = useTranslation();
  const [isoFilters, updateIsoFilters] = useQueryParamIso(FilterQueryParams);

  // TODO: this was causing an infinite loop. We may not need this
  React.useEffect(() => onChange(isoFilters.active), [
    isoFilters.active,
    onChange,
  ]);

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
    [updateIsoFilters, isoFilters]
  );

  return (
    <>
      <InputLabel>{t(label)}</InputLabel>
      <Grid item>
        <FormControlLabel
          checked={
            isoFilters.active === true || isoFilters.active === undefined
          }
          control={<Checkbox onChange={updateActiveFilter(true)} />}
          label={t(activeLabel)}
        />
        <FormControlLabel
          checked={
            isoFilters.active === false || isoFilters.active === undefined
          }
          control={<Checkbox onChange={updateActiveFilter(false)} />}
          label={t(inactiveLabel)}
        />
      </Grid>
    </>
  );
};
