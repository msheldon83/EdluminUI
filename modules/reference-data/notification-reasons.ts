import { useQueryBundle } from "graphql/hooks";
import { GetNotificationReasons } from "./get-notification-reasons.gen";
import { useMemo } from "react";
import { OrgUserRole } from "graphql/server-types.gen";
import { compact } from "lodash-es";

export function useNotificationReasons() {
  const notificationReasons = useQueryBundle(GetNotificationReasons, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (
      notificationReasons.state === "DONE" &&
      notificationReasons.data.referenceData
    ) {
      return (
        compact(notificationReasons.data.referenceData.notificationReasons) ??
        []
      );
    }
    return [];
  }, [notificationReasons]);
}

export function useAdminNotificationReasons() {
  const reasons = useNotificationReasons();

  return useMemo(
    () =>
      reasons.filter(
        x =>
          x.appliesToRole === OrgUserRole.Administrator ||
          x.appliesToRole === OrgUserRole.AdminOrEmployee ||
          x.appliesToRole === OrgUserRole.AdminOrReplacement
      ),
    [reasons]
  );
}

export function useEmployeeNotificationReasons() {
  const reasons = useNotificationReasons();

  return useMemo(
    () =>
      reasons.filter(
        x =>
          x.appliesToRole === OrgUserRole.Employee ||
          x.appliesToRole === OrgUserRole.AdminOrEmployee
      ),
    [reasons]
  );
}

export function useSubstituteNotificationReasons() {
  const reasons = useNotificationReasons();

  return useMemo(
    () =>
      reasons.filter(
        x =>
          x.appliesToRole === OrgUserRole.ReplacementEmployee ||
          x.appliesToRole === OrgUserRole.AdminOrReplacement
      ),
    [reasons]
  );
}
