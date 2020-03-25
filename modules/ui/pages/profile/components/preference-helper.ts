import { useMemo } from "react";
import {
  useAdminNotificationReasons,
  useEmployeeNotificationReasons,
  useSubstituteNotificationReasons,
} from "reference-data/notification-reasons";
import { useIsAdmin } from "reference-data/is-admin";
import { useIsEmployee } from "reference-data/is-employee";
import { useIsSubstitute } from "reference-data/is-substitute";
import { compact } from "lodash-es";
import {
  NotificationReason,
  NotificationPreferenceInput,
} from "graphql/server-types.gen";

export const useNotificationPreferencesForUser = (
  notificationPreferences: NotificationPreferenceInput[]
) => {
  const isAdmin = useIsAdmin();
  const adminReasons = useAdminNotificationReasons();
  const isEmployee = useIsEmployee();
  const employeeReasons = useEmployeeNotificationReasons();
  const isSubstitute = useIsSubstitute();
  const subReasons = useSubstituteNotificationReasons();

  let ids: NotificationReason[] = [];
  if (isAdmin) {
    ids = ids.concat(compact(adminReasons.map(a => a.enumValue)));
  }
  if (isEmployee) {
    ids = ids.concat(compact(employeeReasons.map(a => a.enumValue)));
  }
  if (isSubstitute) {
    ids = ids.concat(compact(subReasons.map(a => a.enumValue)));
  }

  const uniqueIds = [...new Set(ids)];

  return useMemo(
    () =>
      notificationPreferences
        .filter(x => uniqueIds.includes(x.notificationReasonId ?? ""))
        .sort((a, b) =>
          a.notificationReasonId.toString() > b.notificationReasonId.toString()
            ? 1
            : -1
        ),
    [notificationPreferences, uniqueIds]
  );
};
