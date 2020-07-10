import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import BusinessIcon from "@material-ui/icons/Business";
import DateRangeIcon from "@material-ui/icons/DateRange";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import HomeIcon from "@material-ui/icons/Home";
import LocationCityIcon from "@material-ui/icons/LocationCity";
import LockIcon from "@material-ui/icons/Lock";
import PeopleIcon from "@material-ui/icons/People";
import SettingsIcon from "@material-ui/icons/Settings";
import SwapCallsIcon from "@material-ui/icons/SwapCalls";
import TimelineIcon from "@material-ui/icons/Timeline";
import StorageIcon from "@material-ui/icons/Storage";
import {
  canViewAbsVacNavLink,
  canViewAnalyticsReportsNavLink,
  canViewCalendarsNavLink,
  canViewConfigNavLink,
  canViewEmpSubPrefNavLink,
  canViewPeopleNavLink,
  canViewPTOBalancesNavLink,
  canViewSchoolsNavLink,
  canViewSecurityNavLink,
  canViewDataManagementNavLink,
} from "helpers/permissions";
import { PermissionEnum, FeatureFlag } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Can } from "ui/components/auth/can";
import { DailyReportRoute } from "ui/routes/absence-vacancy/daily-report";
import { VerifyOverviewRoute } from "ui/routes/absence-vacancy/verify";
import {
  AdminCreateAbsenceRoute,
  AdminSelectEmployeeForCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { LocationGroupsRoute } from "ui/routes/location-groups";
import { LocationsRoute } from "ui/routes/locations";
import { SecurityManagedOrganizationsRoute } from "ui/routes/security/managed-organizations";
import { SecurityPartnersRoute } from "ui/routes/security/partners";
import { SecurityPermissionSetsRoute } from "ui/routes/security/permission-sets";
import { NavLink, SubNavItemType } from "./nav-link";
import SearchIcon from "@material-ui/icons/Search";
import { VacancyCreateRoute } from "ui/routes/vacancy";
import { DataImportRoute } from "ui/routes/data-import";
import { IntegrationRoute } from "ui/routes/integration";
import { ApprovalInboxRoute } from "ui/routes/approval-inbox";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";

type Props = {
  className?: string;
  route: string;
  navBarExpanded: boolean;
  onClick?: () => void;
  orgId?: string;
};
export const MobileSearchNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Can do={[PermissionEnum.AbsVacView]} orgId={props.orgId}>
      <NavLink title={t("Search")} icon={<SearchIcon />} {...props} />
    </Can>
  );
};

export const HomeNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return <NavLink exact title={t("Home")} icon={<HomeIcon />} {...props} />;
};

export const AbsenceNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const paramsDailyReport = useRouteParams(DailyReportRoute);
  const paramsVerify = useRouteParams(VerifyOverviewRoute);
  const paramsCreate = useRouteParams(AdminCreateAbsenceRoute);
  const paramsVacancyCreate = useRouteParams(VacancyCreateRoute);

  const orgFeatureFlags = useOrgFeatureFlags(props.orgId);
  const orgUsesVerify: boolean = orgFeatureFlags.includes(FeatureFlag.Verify);

  const absenceSubNavItems = React.useMemo(() => {
    const subNavItems = [
      {
        title: t("Create Absence"),
        route: AdminSelectEmployeeForCreateAbsenceRoute.generate(paramsCreate),
        permissions: [PermissionEnum.AbsVacSave],
      },
      {
        title: t("Create Vacancy"),
        route: VacancyCreateRoute.generate(paramsVacancyCreate),
        permissions: [PermissionEnum.AbsVacSave],
      },
      {
        title: t("Daily Report"),
        route: DailyReportRoute.generate(paramsDailyReport),
        permissions: [PermissionEnum.AbsVacView],
      },
      {
        title: t("Approve"),
        route: ApprovalInboxRoute.generate(paramsVerify),
      },
    ] as SubNavItemType[];

    if (orgUsesVerify) {
      subNavItems.push({
        title: t("Verify"),
        route: VerifyOverviewRoute.generate(paramsVerify),
        permissions: [PermissionEnum.AbsVacVerify],
      });
    }

    return subNavItems;
  }, [
    orgUsesVerify,
    paramsCreate,
    paramsDailyReport,
    paramsVacancyCreate,
    paramsVerify,
    t,
  ]);

  return (
    <Can do={canViewAbsVacNavLink} orgId={props.orgId}>
      <NavLink
        title={t("Absence & Vacancy")}
        icon={<SwapCallsIcon />}
        subNavItems={absenceSubNavItems}
        {...props}
      />
    </Can>
  );
};

export const AnalyticsAndReportsNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Can do={canViewAnalyticsReportsNavLink} orgId={props.orgId}>
      <NavLink
        title={t("Analytics & Reports")}
        icon={<TimelineIcon />}
        {...props}
      />
    </Can>
  );
};

export const SchoolsNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const paramsLocations = useRouteParams(LocationsRoute);
  const paramsGroups = useRouteParams(LocationGroupsRoute);
  return (
    <Can do={canViewSchoolsNavLink} orgId={props.orgId}>
      <NavLink
        title={t("Schools")}
        icon={<LocationCityIcon />}
        subNavItems={[
          {
            title: t("Schools"),
            route: LocationsRoute.generate(paramsLocations),
            permissions: [PermissionEnum.LocationView],
          },
          {
            title: t("School Groups"),
            route: LocationGroupsRoute.generate(paramsGroups),
            permissions: [PermissionEnum.LocationGroupView],
          },
        ]}
        {...props}
      />
    </Can>
  );
};

export const PeopleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Can do={canViewPeopleNavLink} orgId={props.orgId}>
      <NavLink title={t("People")} icon={<PeopleIcon />} {...props} />
    </Can>
  );
};

export const CalendarNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();

  return (
    <Can do={canViewCalendarsNavLink} orgId={props.orgId}>
      <NavLink title={t("Calendars")} icon={<DateRangeIcon />} {...props} />
    </Can>
  );
};

export const SettingsNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Can do={canViewConfigNavLink} orgId={props.orgId}>
      <NavLink title={t("Settings")} icon={<SettingsIcon />} {...props} />
    </Can>
  );
};

export const SecurityNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const paramsSecurityPermissionSets = useRouteParams(
    SecurityPermissionSetsRoute
  );
  const paramsSecurityPartners = useRouteParams(SecurityPartnersRoute);
  const paramsSecurityManagedOrganizations = useRouteParams(
    SecurityManagedOrganizationsRoute
  );
  return (
    <Can do={canViewSecurityNavLink} orgId={props.orgId}>
      <NavLink
        title={t("Security")}
        icon={<LockIcon />}
        subNavItems={[
          {
            title: t("Permission Sets"),
            route: SecurityPermissionSetsRoute.generate(
              paramsSecurityPermissionSets
            ),
            permissions: [PermissionEnum.PermissionSetView],
          },
          {
            title: t("Partners"),
            route: SecurityPartnersRoute.generate(paramsSecurityPartners),
            permissions: [PermissionEnum.ExternalConnectionsView],
          },
          {
            title: t("Managed Organizations"),
            route: SecurityManagedOrganizationsRoute.generate(
              paramsSecurityManagedOrganizations
            ),
            permissions: [PermissionEnum.ExternalConnectionsView],
          },
        ]}
        {...props}
      />
    </Can>
  );
};

export const DataManagementNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const paramsDataImports = useRouteParams(DataImportRoute);
  const paramsIntegrations = useRouteParams(IntegrationRoute);
  return (
    <Can do={canViewDataManagementNavLink} orgId={props.orgId}>
      <NavLink
        title={t("Data Management")}
        icon={<StorageIcon />}
        subNavItems={[
          {
            title: t("Imports"),
            route: DataImportRoute.generate(paramsDataImports),
            permissions: [PermissionEnum.DataImport],
          },
          {
            title: t("Integrations"),
            route: IntegrationRoute.generate(paramsIntegrations),
            permissions: [PermissionEnum.ExternalConnectionsView],
          },
        ]}
        {...props}
      />
    </Can>
  );
};

export const MyScheduleNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("My Schedule")} icon={<DateRangeIcon />} {...props} />
  );
};

export const PTOBalancesNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Can do={canViewPTOBalancesNavLink}>
      <NavLink
        title={t("PTO Balances")}
        icon={<AccountBalanceWalletIcon />}
        {...props}
      />
    </Can>
  );
};

export const SubPreferencesNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Can do={canViewEmpSubPrefNavLink}>
      <NavLink
        title={t("Sub Preferences")}
        icon={<SettingsIcon />}
        {...props}
      />
    </Can>
  );
};

export const MyProfileNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("My Profile")} icon={<AccountCircleIcon />} {...props} />
  );
};

export const HelpNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return <NavLink title={t("Help")} icon={<HelpOutlineIcon />} {...props} />;
};

export const SignOutNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink
      title={t("Sign Out")}
      icon={<ExitToAppIcon />}
      route={"/404"}
      {...props}
    />
  );
};

export const OrganizationsNavLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <NavLink title={t("Organizations")} icon={<BusinessIcon />} {...props} />
  );
};
