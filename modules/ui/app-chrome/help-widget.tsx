import * as React from "react";
const { useEffect } = React;
import { useMyUserAccess } from "reference-data/my-user-access";
import { useOrganizationId } from "core/org-context";

export const HelpWidget: React.FC<{}> = () => {
  const userAccess = useMyUserAccess();
  const orgId = useOrganizationId();
  const user = userAccess?.me?.user;
  const orgUser = user?.orgUsers?.find(x => x?.orgId == orgId);
  const showChat = user?.orgUsers?.some(x => x?.administrator?.isSuperUser);

  useEffect(() => {
    const zE = (window as any).zE;
    if (showChat) {
      zE("webWidget", "identify", {
        name: `${user?.firstName} ${user?.lastName}`,
        email: user?.loginEmail,
        organization: orgUser?.organization.name,
      });

      zE("webWidget", "prefill", {
        name: {
          value: `${user?.firstName} ${user?.lastName}`,
          readOnly: false,
        },
        email: { value: user?.loginEmail, readOnly: false },
      });

      zE("webWidget", "show");
    } else {
      zE("webWidget", "hide");
    }
  }),
    [];
  return <></>;
};
