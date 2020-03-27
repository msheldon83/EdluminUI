import { useMemo } from "react";

export const useIsImpersonating = () => {
  const actingUserId = sessionStorage.getItem(
    Config.impersonation.actingUserIdKey
  );

  const isImpersonating = useMemo(() => !!actingUserId, [actingUserId]);

  return isImpersonating;
};
