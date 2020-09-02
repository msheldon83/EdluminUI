import { PermissionEnum, ApprovalStatus } from "graphql/server-types.gen";
import { isToday, isFuture } from "date-fns";
import { OrgUserPermissions, CanDo, Role } from "ui/components/auth/types";
import { flatMap, uniq } from "lodash-es";

export const can = (
  canDo: CanDo,
  userPermissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string | null | undefined,
  forRole?: Role | null | undefined,
  context?: any
) => {
  // Sys Admins rule the world
  if (isSysAdmin) return true;

  // We were provided a permission check function so execute it
  if (!Array.isArray(canDo)) {
    return canDo(
      userPermissions,
      isSysAdmin,
      orgId ?? undefined,
      forRole ?? undefined,
      context ?? undefined
    );
  }

  // We were provided a list of permissions to check
  // Make sure the User has at least one of the permissions in at least one of their Orgs
  const userPerms = getUserPermissions(userPermissions, orgId, forRole);
  return userPerms.some((el: any) => {
    return canDo.includes(el);
  });
};

const getUserPermissions = (
  permissions: OrgUserPermissions[],
  orgId?: string | null | undefined,
  role?: Role | null | undefined
): PermissionEnum[] => {
  let permissionsByOrg = permissions.slice(0);
  if (orgId) {
    // If org id was passed, filter down to that Org
    permissionsByOrg = permissionsByOrg.filter(e => e.orgId === orgId);
  }

  if (role) {
    // Return all permissions for the specified role
    return uniq(
      flatMap(
        permissionsByOrg.map(
          p => p.permissionsByRole.find(r => r.role === role)?.permissions ?? []
        )
      )
    );
  }

  // Return all of the permissions we have remaining
  const allPermissions = uniq(
    flatMap(permissionsByOrg.map(p => p.permissions))
  );
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
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);

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
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  if (!userPerms?.includes(PermissionEnum.AbsVacView)) {
    return false;
  }

  return true;
};
export const canViewVerifyNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  if (!userPerms?.includes(PermissionEnum.AbsVacVerify)) {
    return false;
  }
  return true;
};
export const canViewAnalyticsReportsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  return (
    canViewAbsenceAndVacancyReports(permissions, isSysAdmin, orgId, forRole) ||
    canViewPeopleReports(permissions, isSysAdmin, orgId, forRole)
  );
};
export const canViewSchoolsNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
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
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  /* if (!userPerms?.includes(PermissionEnum.LocationView)) {
    return false;
  } */

  return true;
};
export const canViewPeopleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
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
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  if (!userPerms?.includes(PermissionEnum.CalendarChangeView)) {
    return false;
  }

  return true;
};
export const canViewConfigNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  if (
    !userPerms?.includes(PermissionEnum.GeneralSettingsView) &&
    !userPerms?.includes(PermissionEnum.ScheduleSettingsView) &&
    !userPerms?.includes(PermissionEnum.AbsVacSettingsView) &&
    !userPerms?.includes(PermissionEnum.FinanceSettingsView) &&
    !userPerms?.includes(PermissionEnum.ApprovalSettingsView)
  ) {
    return false;
  }

  return true;
};
export const canViewSecurityNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
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
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  //perform permission checks

  return true;
};

export const canViewDataManagementNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;

  const userPerms = getUserPermissions(permissions, orgId);
  if (
    !userPerms?.includes(PermissionEnum.DataImport) &&
    !userPerms?.includes(PermissionEnum.ExternalConnectionsView)
  ) {
    return false;
  }

  return true;
};

/* emp left nav helpers */
export const canViewEmpMyScheduleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  //perform permission checks

  return true;
};
export const canViewPTOBalancesNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  if (!userPerms?.includes(PermissionEnum.EmployeeViewBalances)) {
    return false;
  }

  return true;
};
export const canViewEmpSubPrefNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);

  if (!userPerms?.includes(PermissionEnum.EmployeeSaveFavoriteSubs)) {
    return false;
  }

  return true;
};

/* sub left nav helpers */
export const canViewSubMyScheduleNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);

  //perform permission checks

  return true;
};
export const canViewSubSubPrefNavLink = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);

  //perform permission checks

  return true;
};

/* admin home */
export const canAssignSub = (
  absDate: Date,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined,
  isApprovedForSubJobSearch?: boolean
) => {
  if (isSysAdmin) return true;

  if (forRole === "employee" && isApprovedForSubJobSearch === false) {
    return false;
  }

  const userPerms = getUserPermissions(permissions, orgId, forRole);
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
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;

  const userPerms = getUserPermissions(permissions, orgId, forRole);
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

export const canEditAbsVac = (
  absDate: Date,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined,
  approvalStatus?: ApprovalStatus | null
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);

  if (!canEditApprovedAbsVac(userPerms, forRole, approvalStatus)) return false;

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

const canEditApprovedAbsVac = (
  userPerms: PermissionEnum[],
  forRole?: Role | null | undefined,
  approvalStatus?: ApprovalStatus | null
) => {
  // Employees cannot edit absences that have been approved
  if (forRole === "employee") {
    if (
      approvalStatus === ApprovalStatus.PartiallyApproved ||
      approvalStatus === ApprovalStatus.Approved
    )
      return false;
  } else {
    if (
      approvalStatus === ApprovalStatus.PartiallyApproved &&
      !userPerms.includes(PermissionEnum.AbsVacEditPartiallyApproved)
    )
      return false;

    if (
      approvalStatus === ApprovalStatus.Approved &&
      !userPerms.includes(PermissionEnum.AbsVacEditApproved)
    )
      return false;
  }

  return true;
};

export const canRemoveSub = (
  absDate: Date,
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
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
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
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
  isShadowRecord: boolean,
  orgId?: string,
  shadowFromOrgId?: string | null,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) {
    return true;
  }

  let userPerms = [] as PermissionEnum[];
  if (isShadowRecord) {
    userPerms = getUserPermissions(permissions, shadowFromOrgId, forRole);
  } else {
    userPerms = getUserPermissions(permissions, orgId, forRole);
  }
  if (isAdmin) {
    if (!userPerms?.includes(PermissionEnum.AdminSave)) {
      return false;
    }
  }
  if (isEmployee) {
    if (!userPerms?.includes(PermissionEnum.EmployeeSave)) {
      return false;
    }
  }
  if (isReplacementEmployee) {
    if (!userPerms?.includes(PermissionEnum.SubstituteSave)) {
      return false;
    }
  }
  return true;
};

export const canDeleteOrgUser = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  isAdmin: boolean,
  isEmployee: boolean,
  isReplacementEmployee: boolean,
  orgId?: string,
  isShadowRecord?: boolean,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) {
    return true;
  }

  if (isShadowRecord) {
    return false;
  }

  const userPerms = getUserPermissions(permissions, orgId, forRole);
  if (isAdmin) {
    if (!userPerms?.includes(PermissionEnum.AdminDelete)) {
      return false;
    }
  }
  if (isEmployee) {
    if (!userPerms?.includes(PermissionEnum.EmployeeDelete)) {
      return false;
    }
  }
  if (isReplacementEmployee) {
    if (!userPerms?.includes(PermissionEnum.SubstituteDelete)) {
      return false;
    }
  }
  return true;
};

export const canCreateAdmin = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId, forRole);
  return !!userPerms?.includes(PermissionEnum.AdminSave);
};

export const canCreateEmployee = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId, forRole);
  return !!userPerms?.includes(PermissionEnum.EmployeeSave);
};

export const canCreateSubstitute = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) {
    return true;
  }

  const userPerms = getUserPermissions(permissions, orgId, forRole);
  return !!userPerms?.includes(PermissionEnum.SubstituteSave);
};

export const canEditEmployee = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined,
  context?: any
) => {
  if (isSysAdmin) {
    return true;
  }

  if (context?.isShadowRecord) return false;

  const userPerms = getUserPermissions(permissions, orgId, forRole);
  return !!userPerms?.includes(PermissionEnum.EmployeeSave);
};

export const canEditSub = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined,
  context?: any
) => {
  if (isSysAdmin) {
    return true;
  }

  let userPerms = [] as PermissionEnum[];
  if (context?.isShadowRecord) {
    userPerms = getUserPermissions(
      permissions,
      context?.shadowFromOrgId,
      forRole
    );
  } else {
    userPerms = getUserPermissions(permissions, orgId, forRole);
  }

  return !!userPerms?.includes(PermissionEnum.SubstituteSave);
};

export const canEditAdmin = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined,
  context?: any
) => {
  if (isSysAdmin) {
    return true;
  }

  if (context?.isShadowRecord) return false;

  const userPerms = getUserPermissions(permissions, orgId, forRole);
  return !!userPerms?.includes(PermissionEnum.AdminSave);
};

export const canEditPermissionSet = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined,
  context?: any
) => {
  if (isSysAdmin) {
    return true;
  }

  if (context?.isShadowRecord) return false;

  const userPerms = getUserPermissions(permissions, orgId, forRole);
  return !!userPerms?.includes(PermissionEnum.PermissionSetSave);
};

export const canViewAbsenceAndVacancyReports = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  const viewPermissions = userPerms?.filter(
    x =>
      x === PermissionEnum.ReportsAbsVacSchema ||
      x === PermissionEnum.AbsVacView
  );
  return (viewPermissions?.length ?? 0) > 0;
};

export const canViewPeopleReports = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  orgId?: string,
  forRole?: Role | null | undefined
) => {
  if (isSysAdmin) return true;
  const userPerms = getUserPermissions(permissions, orgId, forRole);
  const viewPermissions = userPerms?.filter(
    x =>
      x === PermissionEnum.ReportsEmpSchema ||
      x === PermissionEnum.ReportsSubSchema
  );
  return (viewPermissions?.length ?? 0) > 0;
};

export const canViewAbsVacActivityLog = (
  permissions: OrgUserPermissions[],
  isSysAdmin: boolean,
  isAdmin: boolean,
  orgId?: string
) => {
  if (isSysAdmin) return true;

  // Only admins can see the activity log, however the AbsVacView permission applies to Admins and Employees
  if (!isAdmin) return false;
  const userPerms = getUserPermissions(permissions, orgId, "admin");

  if (!userPerms?.includes(PermissionEnum.AbsVacView)) {
    return false;
  }

  return true;
};
