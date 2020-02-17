import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";

declare let $zopim: any;
declare let zE: any;
export const HelpWidget: React.FC<{}> = props => {
  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const showChat = user?.orgUsers?.some(x => x?.administrator?.isSuperUser);

  if (showChat) {
    zE("webWidget", "identify", {
      name: `${user?.firstName} ${user?.lastName}`,
      email: user?.loginEmail,
    });
    if ($zopim) {
      $zopim.livechat.button.show();
    }
  } else {
    if ($zopim) {
      $zopim.livechat.button.hide();
    }
  }
  return <></>;
};
