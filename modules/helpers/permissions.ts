import { useMyUserAccess } from "../reference-data/my-user-access";

export const can = (permission: string, orgId?: string) => {
  const userAccess = useMyUserAccess();

  //if org is passed in then check if user is able to access org

  //if no org is passed in assume this is an employee and check permission for org associated with employee

  //return userAccess.Permissions.includes(permission);

  return true;
};

/* admin left nav helpers */
export const canViewAbsVacNavLink = (orgId?: string) => {
  //call can for specific permissions

  return true;
};
export const canViewDailyReportNavLink = (orgId?: string) => {
  return true;
};
export const canViewVerifyNavLink = (orgId?: string) => {
  return true;
};
export const canViewAnalyticsReportsNavLink = (orgId?: string) => {
  return true;
};
export const canViewSchoolsNavLink = (orgId?: string) => {
  return true;
};
export const canViewSchoolsGroupsNavLink = (orgId?: string) => {
  return true;
};
export const canViewPeopleNavLink = (orgId?: string) => {
  return true;
};
export const canViewCalendarsNavLink = (orgId?: string) => {
  return true;
};
export const canViewConfigNavLink = (orgId?: string) => {
  return true;
};
export const canViewSecurityNavLink = (orgId?: string) => {
  return true;
};
export const canViewOrganizationsNavLink = (orgId?: string) => {
  return true;
};
