import * as React from "react";
const { useEffect } = React;
import { useMyUserAccess } from "reference-data/my-user-access";

export const HelpWidget: React.FC<{}> = () => {
  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const showChat = user?.orgUsers?.some(x => x?.administrator?.isSuperUser);

  useEffect(() => {
    const zopim = (window as any).zE;
    if (showChat) {
      zopim("webWidget", "prefill", {
        name: {
          value: `${user?.firstName} ${user?.lastName}`,
          readOnly: false,
        },
        email: { value: user?.loginEmail, readOnly: false },
      });
      zopim("webWidget", "show");
    } else {
      zopim("webWidget", "hide");
    }
  }),
    [];
  return <></>;
};
