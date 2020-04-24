import {
  NotificationPreferenceInput,
  OrgUserRole,
  RefNotificationReason,
  NotificationReason,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";

export type NotificationPreferenceGroup = {
  notificationReasonId: NotificationReason;
  receiveInAppNotifications?: boolean;
  receiveEmailNotifications?: boolean;
  receiveSmsNotifications?: boolean;
  originalIndex: number;
};

export type GroupedNotificationPreferences = {
  preferences: NotificationPreferenceGroup[];
  role: OrgUserRole;
};

export const groupNotificationPreferencesByRole = (
  notificationPreferences: NotificationPreferenceInput[],
  userNotificationReasons: RefNotificationReason[]
) => {
  const groupedNotifications = [] as GroupedNotificationPreferences[];

  const subNotificationPreferences = compact(
    notificationPreferences.map((o, i) => {
      const reasonRole = userNotificationReasons.find(
        x => x.enumValue === o.notificationReasonId
      )?.appliesToRole;
      if (reasonRole === OrgUserRole.ReplacementEmployee) {
        return { ...o, originalIndex: i } as NotificationPreferenceGroup;
      }
    })
  );
  if (subNotificationPreferences.length > 0) {
    groupedNotifications.push({
      role: OrgUserRole.ReplacementEmployee,
      preferences: subNotificationPreferences,
    });
  }

  const employeeNotificationPreferences = compact(
    notificationPreferences.map((o, i) => {
      const reasonRole = userNotificationReasons.find(
        x => x.enumValue === o.notificationReasonId
      )?.appliesToRole;
      if (reasonRole === OrgUserRole.Employee) {
        return { ...o, originalIndex: i } as NotificationPreferenceGroup;
      }
    })
  );

  if (employeeNotificationPreferences.length > 0) {
    groupedNotifications.push({
      role: OrgUserRole.Employee,
      preferences: employeeNotificationPreferences,
    });
  }

  const adminNotificationPreferences = compact(
    notificationPreferences.map((o, i) => {
      const reasonRole = userNotificationReasons.find(
        x => x.enumValue === o.notificationReasonId
      )?.appliesToRole;
      if (reasonRole === OrgUserRole.Administrator) {
        return { ...o, originalIndex: i } as NotificationPreferenceGroup;
      }
    })
  );

  if (adminNotificationPreferences.length > 0) {
    groupedNotifications.push({
      role: OrgUserRole.Administrator,
      preferences: adminNotificationPreferences,
    });
  }

  return groupedNotifications;
};
