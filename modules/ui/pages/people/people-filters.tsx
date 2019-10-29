import {
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Section } from "ui/components/section";
import { useQueryParams } from "hooks/query-params";
import { Isomorphism } from "@atomic-object/lenses";
import { OrgUserRole } from "graphql/server-types.gen";

type Props = { className?: string };

export const FilterQueryParamDefaults: PeopleFilters = {
  // name: "",
  firstName: "desc",
  lastName: "",
  roleFilter: "",
};

type PeopleFilters = {
  // name: string | "";
  firstName: "asc" | "desc" | "";
  lastName: "asc" | "desc" | "";
  // active: boolean,
} & (
  | { roleFilter: "" }
  | {
      roleFilter: OrgUserRole.Employee;
      // location: { id: number; name: string }[];
      // positionType: string;
    }
  | {
      roleFilter: OrgUserRole.ReplacementEmployee;
      // endorsements: { id: number; name: string }[]
    }
  | {
      roleFilter: OrgUserRole.Administrator;
      // managesLocation: { id: number; name: string }[];
      // managesPositionType: string;
    });

// const FilterParams: Isomorphism<
//   typeof FilterQueryParamDefaults,
//   PeopleFilters
// > = {
//   to: k => ({
//     firstName: k.firstName,
//     lastName: k.lastName,
//     roleFilter: k.roleFilter
//   }),
//   from: s => ({
//     // page: s.page.toString(),
//     firstName: s.firstName,
//     lastName: s.lastName ,
//     roleFilter: s.roleFilter
//   }),
// };

// export const FilterQueryParams = {
//   defaults: FilterQueryParamDefaults,
//   iso: FilterParams,
// };

export const PeopleFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [filters, updateFilters] = useQueryParams(FilterQueryParamDefaults);

  const updateRoleFilter = React.useCallback(
    (event: React.ChangeEvent<{}>, newRoleFilter: string) => {
      updateFilters({ ...filters, roleFilter: newRoleFilter });
    },
    [updateFilters, filters]
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
        <Grid container>
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
          <Grid item container md={3}>
            {/* position type */}
          </Grid>
          <Grid item container md={3}>
            {/* locations */}
          </Grid>

          <Grid item container md={3}>
            <InputLabel className={classes.label}>{t("Status")}</InputLabel>
            <Grid item container>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={true}
                    // onChange={updateQueryParams({
                    //   active: "true",
                    //   ...queryParams,
                    // })}
                    value=""
                  />
                }
                label={t("Active")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={true}
                    // onChange={updateQueryParams({
                    //   active: "false",
                    //   ...queryParams,
                    // })}
                    value=""
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
