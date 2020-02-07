import {
  PermissionEnum,
  VacancyQualification,
  VacancyAvailability,
} from "graphql/server-types.gen";
import { isPast, isToday, isFuture } from "date-fns";
import { OrgUserPermissions, CanDo } from "ui/components/auth/types";
import { flatMap, uniq } from "lodash-es";

export const can = (
  canDo: CanDo,
  userPermissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string | null | undefined
) => {
  // Sys Admins rule the world
  if (isSysAdmin) return true;

  // We were provided a permission check function so execute it
  if (!Array.isArray(canDo)) {
    return canDo(userPermissions, isSysAdmin, orgId ?? undefined);
  }

  // We were provided a list of permissions to check
  // Make sure the User has at least one of the permissions in at least one of their Orgs
  const userPerms = getUserPermissions(userPermissions, orgId);
  return userPerms.some((el: any) => {
    return canDo.includes(el);
  });
};

const getUserPermissions = (
  permissions: OrgUserPermissions[],
  orgId?: string | null | undefined
): PermissionEnum[] => {
  if (orgId) {
    // If org id was passed, return permissions for that Org
    // Will return an empty list if we can't find the Org Id in OrgUserPermissions
    return permissions.find(e => e.orgId == orgId)?.permissions ?? [];
  }

  // When we don't have an Org Id, return a list of all of the
  // permissions that the User has across Organizations
  const allPermissions = uniq(flatMap(permissions.map(p => p.permissions)));
  return allPermissions;
};

export const canViewAsSysAdmin = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  return isSysAdmin;
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
  absDate: Date,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
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

export const canReassignSub = (
  absDate: Date,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;

  const userPerms = getUserPermissions(permissions, orgId);
  if (
    !isToday(absDate) &&
    !isFuture(absDate) &&
    (!userPerms?.includes(PermissionEnum.AbsVacAssign) ||
      !userPerms?.includes(PermissionEnum.AbsVacEditPast) ||
      !userPerms?.includes(PermissionEnum.AbsVacRemoveSub))
  ) {
    return false;
  } else if (
    (isToday(absDate) || isFuture(absDate)) &&
    (!userPerms?.includes(PermissionEnum.AbsVacAssign) ||
      !userPerms?.includes(PermissionEnum.AbsVacRemoveSub))
  ) {
    return false;
  }

  return true;
};

export const canAssignUnQualifiedAndUnAvailableSub = (
  qualified: VacancyQualification,
  available: VacancyAvailability,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;

  const userPerms = getUserPermissions(permissions, orgId);
  if (
    qualified !== VacancyQualification.NotQualified &&
    available !== VacancyAvailability.MinorConflict &&
    userPerms?.includes(PermissionEnum.AbsVacAssign)
  ) {
    return true;
  }

  let result = true;
  if (
    qualified === VacancyQualification.NotQualified &&
    !userPerms?.includes(PermissionEnum.AbsVacAssignUnqualified)
  ) {
    result = false;
  }
  if (
    available === VacancyAvailability.MinorConflict &&
    !userPerms?.includes(PermissionEnum.AbsVacAssignMinorConflict)
  ) {
    result = false;
  }

  return result;
};

export const canEditAbsence = (
  absDate: Date,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
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
  absDate: Date,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
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
  const canEditAdmin =
    isAdmin && !!userPerms?.includes(PermissionEnum.AdminSave);
  const canEditEmployee =
    isEmployee && !!userPerms?.includes(PermissionEnum.EmployeeSave);
  const canEditSubstitute =
    isReplacementEmployee &&
    !!userPerms?.includes(PermissionEnum.SubstituteSave);

  return canEditAdmin || canEditEmployee || canEditSubstitute;
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
  const canDeleteAdmin =
    isAdmin && !!userPerms?.includes(PermissionEnum.AdminDelete);
  const canDeleteEmployee =
    isEmployee && !!userPerms?.includes(PermissionEnum.EmployeeDelete);
  const canDeleteSubstitute =
    isReplacementEmployee &&
    !!userPerms?.includes(PermissionEnum.SubstituteDelete);

  return canDeleteAdmin || canDeleteEmployee || canDeleteSubstitute;
};

export const canCreateAdmin = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId);
  return !!userPerms?.includes(PermissionEnum.AdminSave);
};

export const canCreateEmployee = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId);
  return !!userPerms?.includes(PermissionEnum.EmployeeSave);
};

export const canCreateSubstitute = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId);
  return !!userPerms?.includes(PermissionEnum.SubstituteSave);
};
