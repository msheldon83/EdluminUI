import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
} from "@material-ui/core";
import { OrgUserRole } from "graphql/server-types.gen";
import { useQueryParams, useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import {
  FilterQueryParamDefaults,
  FilterQueryParams,
  ActiveStatus,
} from "./filter-params";
import { FiltersByRole } from "./filters-by-role";

type Props = { className?: string };

export const PeopleFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [filters, updateFilters] = useQueryParams(FilterQueryParamDefaults);
  const [isoFilters, updateIsoFilters] = useQueryParamIso(FilterQueryParams);

  const updateRoleFilter = React.useCallback(
    (event: React.ChangeEvent<{}>, newRoleFilter: string) => {
      updateFilters({ roleFilter: newRoleFilter });
    },
    [updateFilters]
  );

  const updateActiveFilter = React.useCallback(
    e => {
      console.log("event ==>", e.target.value);
      return updateIsoFilters({
        active: e.target.value,
      });
    },
    [updateIsoFilters]
  );

  return (
    <Paper square className={props.className}>
      <Tabs
        value={filters.roleFilter}
        indicatorColor="primary"
        textColor="primary"
        onChange={updateRoleFilter}
        aria-label="people-role-filters"
      >
        <Tab label={t("All")} value={""} className={classes.tab} />
        <Tab
          label={t("Employees")}
          value={OrgUserRole.Employee}
          className={classes.tab}
        />
        <Tab
          label={t("Substitutes")}
          value={OrgUserRole.ReplacementEmployee}
          className={classes.tab}
        />
        <Tab
          label={t("Admins")}
          value={OrgUserRole.Administrator}
          className={classes.tab}
        />
      </Tabs>

      <Section>
        <Grid container justify="space-between">
          <Grid item container md={3}>
            <InputLabel className={classes.label}>{t("Name")}</InputLabel>
            <TextField
              className={classes.textField}
              variant="outlined"
              name={"name"}
              placeholder={t("Search for first or last name")}
              fullWidth
            />
          </Grid>

          <FiltersByRole />

          <Grid item container md={2}>
            <InputLabel className={classes.label}>{t("Status")}</InputLabel>
            <Grid item container>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      filters.active === "active" || filters.active === "all"
                    }
                    onChange={updateActiveFilter}
                    value={"active"}
                  />
                }
                label={t("Active")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      filters.active === "inactive" || filters.active === "all"
                    }
                    onChange={updateActiveFilter}
                    value="inactive"
                  />
                }
                label={t("Inactive")}
              />
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </Paper>
  );
};

const useStyles = makeStyles(theme => ({
  tab: {
    textTransform: "uppercase",
  },
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
  },
  textField: {
    marginTop: theme.spacing(2),
  },
}));
