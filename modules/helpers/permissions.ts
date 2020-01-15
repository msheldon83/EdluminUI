import { OrgUserPermissions } from "reference-data/my-user-access";
import { PermissionEnum } from "graphql/server-types.gen";
import { Detail } from "ui/components/reports/daily-report/helpers";
import { isPast, isToday, isFuture } from "date-fns";

export const can = (
  permissions: PermissionEnum[],
  userPermissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(userPermissions, orgId);
  if (!userPerms === undefined) return false;
  return userPerms!.some((el: any) => {
    return permissions.includes(el);
  });
};

const includesOrg = (orgId: string, permissions: OrgUserPermissions[]) => {
  if (!permissions) return false;
  return !!permissions.find(p => p.orgId === orgId);
};

const getFirstOrg = (permissions: OrgUserPermissions[]) => {
  if (permissions && permissions.length > 0) {
    return permissions[0].orgId;
  } else {
    return null;
  }
};

const getUserPermissions = (
  permissions: OrgUserPermissions[],
  orgId?: string | null | undefined
) => {
  //if org id was passed check if orgid is in list of orgs user has access to (admin)
  if (orgId && !includesOrg(orgId, permissions)) {
    return [];
  }
  const currentOrg = orgId || getFirstOrg(permissions);
  if (!currentOrg) return [];

  return permissions.find(e => e.orgId == currentOrg)?.permissions;
};

/* admin left nav helpers */
export const canViewAbsVacNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);

  if (
    !userPerms?.includes(PermissionEnum.AbsVacView) &&
    !userPerms?.includes(PermissionEnum.AbsVacVerify)
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
  const userPerms = getUserPermissions(permissions, orgId);
  if (!userPerms?.includes(PermissionEnum.AbsVacView)) {
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
  const userPerms = getUserPermissions(permissions, orgId);
  if (!userPerms?.includes(PermissionEnum.AbsVacVerify)) {
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
  const userPerms = getUserPermissions(permissions, orgId);
  //perform permission checks

  return true;
};
export const canViewSchoolsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);
  if (
    !userPerms?.includes(PermissionEnum.LocationView) &&
    !userPerms?.includes(PermissionEnum.LocationGroupView)
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
  const userPerms = getUserPermissions(permissions, orgId);
  /* if (!userPerms?.includes(PermissionEnum.LocationView)) {
    return false;
  } */

  return true;
};
export const canViewPeopleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);
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
  const userPerms = getUserPermissions(permissions, orgId);
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
  const userPerms = getUserPermissions(permissions, orgId);
  if (
    !userPerms?.includes(PermissionEnum.GeneralSettingsView) &&
    !userPerms?.includes(PermissionEnum.ScheduleSettingsView) &&
    !userPerms?.includes(PermissionEnum.AbsVacSettingsView) &&
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
  const userPerms = getUserPermissions(permissions, orgId);
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
  const userPerms = getUserPermissions(permissions, orgId);
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
  const userPerms = getUserPermissions(permissions, orgId);
  //perform permission checks

  return true;
};
export const canViewPTOBalancesNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true; //if org id was passed check if orgid is in list of orgs user has access to (admin)
  const userPerms = getUserPermissions(permissions, orgId);
  if (!userPerms?.includes(PermissionEnum.EmployeeViewBalances)) {
    return false;
  }

  return true;
};
export const canViewEmpSubPrefNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);

  if (!userPerms?.includes(PermissionEnum.EmployeeSaveFavoriteSubs)) {
    return false;
  }

  return true;
};

/* sub left nav helpers */
export const canViewSubMyScheduleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);

  //perform permission checks

  return true;
};
export const canViewSubSubPrefNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);

  //perform permission checks

  return true;
};

/* admin home */
export const canAssignSub = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  absDate: Date
) => {
  if (isSysAdmin) return true;

  const userPerms = getUserPermissions(permissions, orgId);
  if (
    !isToday(absDate) &&
    !isFuture(absDate) &&
    (!userPerms?.includes(PermissionEnum.AbsVacAssign) ||
      !userPerms?.includes(PermissionEnum.AbsVacEditPast))
  ) {
    return false;
  } else if (
    (isToday(absDate) || isFuture(absDate)) &&
    !userPerms?.includes(PermissionEnum.AbsVacAssign)
  ) {
    return false;
  }

  return true;
};

export const canEditSub = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  absDate: Date
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);
  if (
    !isToday(absDate) &&
    !isFuture(absDate) &&
    !userPerms?.includes(PermissionEnum.AbsVacEditPast)
  ) {
    return false;
  } else if (
    (isToday(absDate) || isFuture(absDate)) &&
    !userPerms?.includes(PermissionEnum.AbsVacSave)
  ) {
    return false;
  }

  return true;
};

export const canRemoveSub = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  absDate: Date
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);
  if (
    !isToday(absDate) &&
    !isFuture(absDate) &&
    (!userPerms?.includes(PermissionEnum.AbsVacRemoveSub) ||
      !userPerms?.includes(PermissionEnum.AbsVacEditPast))
  ) {
    return false;
  } else if (
    (isToday(absDate) || isFuture(absDate)) &&
    !userPerms?.includes(PermissionEnum.AbsVacRemoveSub)
  ) {
    return false;
  }

  return true;
};

export const canViewMultiplePeopleRoles = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId);
  const roleViewPermissions = userPerms?.filter(
    x =>
      x === PermissionEnum.EmployeeView ||
      x === PermissionEnum.SubstituteView ||
      x === PermissionEnum.AdminView
  );
  return (roleViewPermissions?.length ?? 0) > 1;
};

export const canDeleteOrgUser = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  isAdmin: boolean,
  isEmployee: boolean,
  isReplacementEmployee: boolean,
  orgId?: string
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId);
  const canEditAdmin =
    isAdmin && !!userPerms?.includes(PermissionEnum.AdminSave);
  const canEditEmployee =
    isEmployee && !!userPerms?.includes(PermissionEnum.EmployeeSave);
  const canEditSubstitute =
    isReplacementEmployee &&
    !!userPerms?.includes(PermissionEnum.SubstituteSave);

  return canEditAdmin || canEditEmployee || canEditSubstitute;
};

export const canEditOrgUser = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  isAdmin: boolean,
  isEmployee: boolean,
  isReplacementEmployee: boolean,
  orgId?: string
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId);
  const canDeleteAdmin =
    isAdmin && !!userPerms?.includes(PermissionEnum.AdminDelete);
  const canDeleteEmployee =
    isEmployee && !!userPerms?.includes(PermissionEnum.EmployeeDelete);
  const canDeleteSubstitute =
    isReplacementEmployee &&
    !!userPerms?.includes(PermissionEnum.SubstituteDelete);

  return canDeleteAdmin || canDeleteEmployee || canDeleteSubstitute;
};
