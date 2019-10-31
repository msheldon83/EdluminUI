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
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { FilterQueryParams, FilterRole } from "./filter-params";
import { FiltersByRole } from "./filters-by-role";

type Props = { className?: string };

export const PeopleFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [isoFilters, updateIsoFilters] = useQueryParamIso(FilterQueryParams);

  const updateRoleFilter = React.useCallback(
    (event: React.ChangeEvent<{}>, newRoleFilter: FilterRole | "") => {
      const roleFilter = newRoleFilter === "" ? null : newRoleFilter;
      updateIsoFilters({ roleFilter });
    },
    [updateIsoFilters]
  );

  const updateActiveFilter = React.useCallback(
    (a: boolean) => () => {
      let active: boolean | undefined = a;
      if (isoFilters.active === undefined) {
        active = !a;
      } else if (isoFilters.active === a || isoFilters.active !== undefined) {
        active = undefined;
      }

      return updateIsoFilters({ active });
    },
    [updateIsoFilters, isoFilters]
  );

  return (
    <Paper square className={props.className}>
      <Tabs
        value={isoFilters.roleFilter === null ? "" : isoFilters.roleFilter}
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
                      isoFilters.active === true ||
                      isoFilters.active === undefined
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
                      isoFilters.active === false ||
                      isoFilters.active === undefined
                    }
                    onChange={updateActiveFilter(false)}
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
