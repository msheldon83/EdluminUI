import { Grid, makeStyles, Tab, Tabs } from "@material-ui/core";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { useDeferredState } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FilterQueryParams,
  FilterRole,
  RoleSpecificFilters,
} from "./filter-params";
import { FiltersByRole } from "./filters-by-role";
import { Input } from "ui/components/form/input";
import { ActiveInactiveFilter } from "ui/components/active-inactive-filter";
import { can } from "helpers/permissions";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { PeopleRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";

type Props = { className?: string };

export const PeopleFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const userAccess = useMyUserAccess();
  const params = useRouteParams(PeopleRoute);

  const orgRelationships = useOrganizationRelationships(params.organizationId);

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
    (
      event: React.ChangeEvent<{}> | undefined,
      newRoleFilter: FilterRole | ""
    ) => {
      const roleFilter = newRoleFilter === "" ? null : newRoleFilter;
      let filters: RoleSpecificFilters;
      switch (roleFilter) {
        case OrgUserRole.Employee:
          filters = { roleFilter, locations: [], positionTypes: [] };
          break;
        case OrgUserRole.Administrator:
          filters = {
            roleFilter,
            locations: [],
            positionTypes: [],
            shadowOrgIds: [params.organizationId],
          };
          break;
        case OrgUserRole.ReplacementEmployee:
          filters = { roleFilter, endorsements: [], shadowOrgIds: [] };
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

  // Build the available role tabs based on permissions
  const filteredTabs: {
    label: string;
    value: "" | FilterRole;
  }[] = useMemo(() => {
    const tabs: {
      label: string;
      value: "" | FilterRole;
    }[] = [];
    // Employees
    if (
      can(
        [PermissionEnum.EmployeeView],
        userAccess?.permissionsByOrg ?? [],
        userAccess?.isSysAdmin ?? false,
        params.organizationId
      )
    ) {
      tabs.push({
        label: t("Employees"),
        value: OrgUserRole.Employee,
      });
    }
    // Substitutes
    if (
      can(
        [PermissionEnum.SubstituteView],
        userAccess?.permissionsByOrg ?? [],
        userAccess?.isSysAdmin ?? false,
        params.organizationId
      )
    ) {
      tabs.push({
        label: t("Substitutes"),
        value: OrgUserRole.ReplacementEmployee,
      });
    }
    // Admins
    if (
      can(
        [PermissionEnum.AdminView],
        userAccess?.permissionsByOrg ?? [],
        userAccess?.isSysAdmin ?? false,
        params.organizationId
      )
    ) {
      tabs.push({
        label: t("Admins"),
        value: OrgUserRole.Administrator,
      });
    }

    // Add the All tab in if we have more than 1 Role tab
    if (tabs.length > 1) {
      tabs.splice(0, 0, { label: t("All"), value: "" });
    }

    return tabs;
  }, [userAccess, params.organizationId, t]);

  // If only have 1 Role tab, we have to default the filters
  // to those that match that Role.
  useEffect(() => {
    if (filteredTabs && filteredTabs.length === 1 && !isoFilters.roleFilter) {
      updateRoleFilter(undefined, filteredTabs[0].value);
    }
  }, [filteredTabs, isoFilters.roleFilter, updateRoleFilter]);

  const tabs = useMemo(() => {
    return (
      <Tabs
        className={classes.tabs}
        value={
          isoFilters.roleFilter === null
            ? filteredTabs[0]?.value ?? ""
            : isoFilters.roleFilter
        }
        indicatorColor="primary"
        textColor="primary"
        onChange={updateRoleFilter}
        aria-label="people-role-filters"
      >
        {filteredTabs.map((t, i) => (
          <Tab
            key={i}
            label={t.label}
            value={t.value}
            className={classes.tab}
          />
        ))}
      </Tabs>
    );
  }, [
    isoFilters.roleFilter,
    updateRoleFilter,
    filteredTabs,
    classes.tabs,
    classes.tab,
  ]);

  return (
    <div className={`${props.className} ${classes.tabsContainer}`}>
      {filteredTabs.length > 0 && tabs}

      <div className={classes.filterSection}>
        <Grid container spacing={2} justify="space-between">
          <Grid item xs={3}>
            <Input
              label={t("Name")}
              value={pendingName}
              onChange={updateNameFilter}
              placeholder={t("Search for first or last name")}
            />
          </Grid>
          <FiltersByRole />
          <Grid item xs={3}>
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
}));
