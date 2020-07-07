import * as React from "react";
const { useEffect } = React;
import { useMyUserAccess } from "reference-data/my-user-access";

export const HelpWidget: React.FC<{}> = () => {
  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const orgUser = user?.orgUsers?.find(x => x?.administrator?.isSuperUser);
  const showChat = orgUser != null;

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
