import { useQueryBundle } from "graphql/hooks";
import { GetNotificationReasons } from "./get-notification-reasons.gen";
import { useMemo } from "react";
import { OrgUserRole } from "graphql/server-types.gen";

export function useNotificationReasons(role?: OrgUserRole) {
  const notificationReasons = useQueryBundle(GetNotificationReasons, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (
      notificationReasons.state === "DONE" &&
      notificationReasons.data.referenceData
    ) {
      if (role) {
        return (
          notificationReasons.data.referenceData.notificationReasons?.filter(
            x => x?.appliesToRole === role
          ) ?? []
        );
      } else {
        return notificationReasons.data.referenceData.notificationReasons ?? [];
      }
    }
    return [];
  }, [notificationReasons, role]);
}
