import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  makeStyles,
  Tab,
  Tabs,
} from "@material-ui/core";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { useDeferredState } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FilterQueryParams,
  FilterRole,
  RoleSpecificFilters,
} from "./filter-params";
import { FiltersByRole } from "./filters-by-role";
import { Input } from "ui/components/form/input";
import { ActiveInactiveFilter } from "ui/components/active-inactive-filter";
import { Can } from "ui/components/auth/can";

type Props = { className?: string };

export const PeopleFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [isoFilters, updateIsoFilters] = useQueryParamIso(FilterQueryParams);
  const [name, pendingName, setPendingName] = useDeferredState(
    isoFilters.name,
    200
  );

  /* Navigating in the browser will update the query params but not
    the state in the UI. Here we update the pending value if the
    param changed and disregarding value stored in state to keep them
    in sync. */
  useEffect(() => {
    if (name !== isoFilters.name) {
      setPendingName(isoFilters.name);
    }
  }, [isoFilters.name]); // eslint-disable-line

  /* As the value changes, update query params */
  useEffect(() => {
    if (name !== isoFilters.name) {
      updateIsoFilters({ name });
    }
  }, [name]); // eslint-disable-line

  const updateRoleFilter = React.useCallback(
    (event: React.ChangeEvent<{}>, newRoleFilter: FilterRole | "") => {
      const roleFilter = newRoleFilter === "" ? null : newRoleFilter;
      let filters: RoleSpecificFilters;
      switch (roleFilter) {
        case OrgUserRole.Employee:
        case OrgUserRole.Administrator:
          filters = { roleFilter, locations: [], positionTypes: [] };
          break;
        case OrgUserRole.ReplacementEmployee:
          filters = { roleFilter, endorsements: [] };
          break;
        case null:
        default:
          filters = { roleFilter };
      }
      updateIsoFilters(filters);
    },
    [updateIsoFilters]
  );

  const updateNameFilter = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingName(event.target.value);
    },
    [setPendingName]
  );

  return (
    <div className={`${props.className} ${classes.tabsContainer}`}>
      <Tabs
        className={classes.tabs}
        value={isoFilters.roleFilter === null ? "" : isoFilters.roleFilter}
        indicatorColor="primary"
        textColor="primary"
        onChange={updateRoleFilter}
        aria-label="people-role-filters"
      >
        <Tab label={t("All")} value={""} className={classes.tab} />
        <Can do={[PermissionEnum.EmployeeView]}>
          <Tab
            label={t("Employees")}
            value={OrgUserRole.Employee}
            className={classes.test}
          />
        </Can>
        <Can do={[PermissionEnum.SubstituteView]}>
          <Tab
            label={t("Substitutes")}
            value={OrgUserRole.ReplacementEmployee}
            className={classes.tab}
          />
        </Can>
        <Can do={[PermissionEnum.AdminView]}>
          <Tab
            label={t("Admins")}
            value={OrgUserRole.Administrator}
            className={classes.tab}
          />
        </Can>
      </Tabs>

      <div className={classes.filterSection}>
        <Grid container justify="space-between">
          <Grid item container md={3}>
            <Input
              label={t("Name")}
              value={pendingName}
              onChange={updateNameFilter}
              placeholder={t("Search for first or last name")}
            />
          </Grid>

          <FiltersByRole />

          <Grid item container md={2}>
            <ActiveInactiveFilter
              label="Status"
              activeLabel="Active"
              inactiveLabel="Inactive"
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  tabsContainer: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderRadius: `${theme.typography.pxToRem(5)} ${theme.typography.pxToRem(
      5
    )} 0 0`,
  },
  tabs: {
    borderBottom: `1px solid ${theme.customColors.sectionBorder}`,
  },
  tab: {
    color: theme.customColors.darkGray,
    fontSize: theme.typography.pxToRem(13),
    fontWeight: 600,
    letterSpacing: theme.typography.pxToRem(1.25),
    lineHeight: theme.typography.pxToRem(16),
    minWidth: theme.typography.pxToRem(130),
    textTransform: "uppercase",
  },
  filterSection: {
    backgroundColor: theme.customColors.white,
    padding: theme.spacing(3),
  },
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
  },
  test: {
    display: "none",
  },
}));
