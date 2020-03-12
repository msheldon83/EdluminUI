import * as React from "react";
const { useEffect } = React;
import { useMyUserAccess } from "reference-data/my-user-access";

export const HelpWidget: React.FC<{}> = () => {
  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const showChat = user?.orgUsers?.some(x => x?.administrator?.isSuperUser);

  useEffect(() => {
    const zE = (window as any).zE;
    if (showChat) {
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
