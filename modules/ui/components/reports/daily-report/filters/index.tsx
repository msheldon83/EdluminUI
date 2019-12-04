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
import { FilterQueryParams } from "./filter-params";
import { SchoolFilter } from "./school-filter";
import { PositionTypeFilter } from "./position-type-filter";
import { DateFilter } from "./date-filter";

type Props = {
  orgId: string;
  className?: string;
  setDate: (date: Date) => void;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);

  return (
    <Grid
      container
      alignItems="center"
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
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={filters.groupByFillStatus}
                onChange={e => {
                  let isChecked = e.target.checked;
                  if (!isChecked && !filters.groupByPositionType) {
                    isChecked = true;
                  }

                  updateFilters({ groupByFillStatus: isChecked });
                }}
              />
            }
            label={t("Fill status")}
          />
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={filters.groupByPositionType}
                onChange={e => {
                  const isChecked = e.target.checked;
                  if (!isChecked && !filters.groupByFillStatus) {
                    updateFilters({
                      groupByFillStatus: true,
                      groupByPositionType: isChecked,
                    });
                  } else {
                    updateFilters({ groupByPositionType: isChecked });
                  }
                }}
              />
            }
            label={t("Position type")}
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
