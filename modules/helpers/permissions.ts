import { OrgUserPermissions } from "reference-data/my-user-access";
import { PermissionEnum } from "graphql/server-types.gen";

export const can = (permission: string, orgId?: string) => {
  //if org is passed in then check if user is able to access org

  //if no org is passed in assume this is an employee and check permission for org associated with employee

  //return userAccess.Permissions.includes(permission);

  return true;
};

const includesOrg = (orgId: string, permissions: OrgUserPermissions[]) => {
  let found = false;
  if (!permissions) return false;
  permissions.forEach(orgPerm => {
    if (orgPerm.orgId === orgId) {
      found = true;
      return;
    }
  });
  return found;
};

const getFirstOrg = (permissions: OrgUserPermissions[]) => {
  if (permissions && permissions.length > 0) {
    return permissions[0].orgId;
  } else {
    return null;
  }
};

/* admin left nav helpers */
export const canViewAbsVacNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)
  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (
    !userPerms?.includes(PermissionEnum.VacancyView) &&
    !userPerms?.includes(PermissionEnum.VacancyVerify)
  ) {
    return false;
  }

  return true;
};
export const canViewDailyReportNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (!userPerms?.includes(PermissionEnum.VacancyView)) {
    return false;
  }

  return true;
};
export const canViewVerifyNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (!userPerms?.includes(PermissionEnum.VacancyVerify)) {
    return false;
  }
  return true;
};
export const canViewAnalyticsReportsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  //perform permission checks

  return true;
};
export const canViewSchoolsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (
    !userPerms?.includes(PermissionEnum.LocationView) &&
    !userPerms?.includes(PermissionEnum.LocationView)
  ) {
    return false;
  }

  return true;
};
export const canViewSchoolsGroupsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (!userPerms?.includes(PermissionEnum.LocationView)) {
    return false;
  }

  return true;
};
export const canViewPeopleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (
    !userPerms?.includes(PermissionEnum.EmployeeView) &&
    !userPerms?.includes(PermissionEnum.SubstituteView) &&
    !userPerms?.includes(PermissionEnum.AdminView)
  ) {
    return false;
  }

  return true;
};
export const canViewCalendarsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (!userPerms?.includes(PermissionEnum.CalendarChangeView)) {
    return false;
  }

  return true;
};
export const canViewConfigNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (
    !userPerms?.includes(PermissionEnum.GeneralSettingsView) &&
    !userPerms?.includes(PermissionEnum.ScheduleSettingsView) &&
    !userPerms?.includes(PermissionEnum.VacancyView) &&
    !userPerms?.includes(PermissionEnum.FinanceSettingsView)
  ) {
    return false;
  }

  return true;
};
export const canViewSecurityNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  if (
    !userPerms?.includes(PermissionEnum.PermissionSetView) &&
    !userPerms?.includes(PermissionEnum.ExternalConnectionsView)
  ) {
    return false;
  }

  return true;
};
export const canViewOrganizationsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  //perform permission checks

  return true;
};

/* emp left nav helpers */
export const canViewEmpMyScheduleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  //perform permission checks

  return true;
};
export const canViewPTOBalancesNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true; //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  const userPerms = permissions.find(e => e.orgId == currentOrg)?.permissions;
  /*if (
    !userPerms?.includes(PermissionEnum.) &&
    !userPerms?.includes(PermissionEnum.ExternalConnectionsView) 
  ) {
    return false;
  }*/

  return true;
};
export const canViewEmpSubPrefNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  //if (
  //!userPerms?.includes(PermissionEnum.employ) &&
  //!userPerms?.includes(PermissionEnum.ExternalConnectionsView)
  //) {
  //  return false;
  //}

  return true;
};

/* sub left nav helpers */
export const canViewSubMyScheduleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  //perform permission checks

  return true;
};
export const canViewSubSubPrefNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  //if org id was passed check if orgid is in list of orgs user has access to (admin)

  if (orgId && !includesOrg(orgId, permissions)) {
    return false;
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return false;

  //perform permission checks

  return true;
};
