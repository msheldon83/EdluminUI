import {
  Grid,
  makeStyles,
  Paper,
  InputLabel,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  groupOptions,
  FilterQueryParams,
  stringToGroupOption,
} from "./filter-params";
import { SchoolFilter } from "./school-filter";
import { PositionTypeFilter } from "./position-type-filter";
import { DateFilter } from "./date-filter";
import { OptionType, Select } from "ui/components/form/select";

type Props = {
  orgId: string;
  className?: string;
  setDate: (date: Date) => void;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);

  const makeOption = (value: string) => {
    let label = value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
    label = label[0].toUpperCase() + label.substring(1);
    return { label, value };
  };

  return (
    <Grid
      container
      alignItems="flex-start"
      justify="flex-start"
      spacing={2}
      className={classes.filters}
    >
      <DateFilter {...filters} dateLabel={t("Date")} setDate={props.setDate} />
      <SchoolFilter
        {...filters}
        orgId={props.orgId}
        locationLabel={t("Schools")}
      />
      <PositionTypeFilter
        {...filters}
        orgId={props.orgId}
        positionTypeLabel={t("Position type")}
      />
      <Grid item container md={3}>
        <Grid item xs={6}>
          <InputLabel>{t("Show")}</InputLabel>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={filters.showAbsences}
                onChange={e =>
                  updateFilters({ showAbsences: e.target.checked })
                }
              />
            }
            label={t("Absences")}
          />
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={filters.showVacancies}
                onChange={e =>
                  updateFilters({ showVacancies: e.target.checked })
                }
              />
            }
            label={t("Vacancies")}
          />
        </Grid>
        <Grid item xs={6}>
          <InputLabel>{t("Group by")}</InputLabel>
          <Select
            options={groupOptions.map(makeOption)}
            value={makeOption(filters.groupDetailsBy)}
            withResetValue={false}
            onChange={value => {
              const newValue = value.value.toString();
              updateFilters({
                groupDetailsBy: stringToGroupOption(newValue, "fillStatus"),
                subGroupDetailsBy:
                  filters.subGroupDetailsBy == newValue
                    ? ""
                    : filters.subGroupDetailsBy,
              });
            }}
            multiple={false}
          />
          <Select
            options={groupOptions
              .filter(o => o != filters.groupDetailsBy)
              .map(makeOption)}
            value={
              filters.subGroupDetailsBy
                ? makeOption(filters.subGroupDetailsBy)
                : undefined
            }
            onChange={value => {
              updateFilters({
                subGroupDetailsBy:
                  value.value === ""
                    ? undefined
                    : stringToGroupOption(
                        value.value.toString(),
                        "positionType"
                      ),
              });
            }}
            multiple={false}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    "@media print": {
      display: "none",
    },
  },
}));
