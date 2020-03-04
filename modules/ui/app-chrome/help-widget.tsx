import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  alwaysHide?: boolean;
};

export const HelpWidget: React.FC<Props> = props => {
  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const showChat = props.alwaysHide
    ? false
    : user?.orgUsers?.some(x => x?.administrator?.isSuperUser);

  //if (props.alwaysHide) showChat = false;

  try {
    const loopsToWait = 10;
    let currentLoopCount = 0;
    const waitForZopim = setInterval(function() {
      if (currentLoopCount >= loopsToWait) {
        clearInterval(waitForZopim);
        return;
      }

      if (
        (window as any).$zopim === undefined ||
        (window as any).$zopim.livechat === undefined
      ) {
        currentLoopCount = currentLoopCount + 1;
        return;
      }

      const zopim = (window as any).$zopim;
      if (showChat) {
        zopim(function() {
          zopim.livechat.setName(`${user?.firstName} ${user?.lastName}`);
          zopim.livechat.setEmail(user?.loginEmail);
        });
        zopim.livechat.button.show();
      } else {
        zopim.livechat.button.hide();
      }

      clearInterval(waitForZopim);
    }, 100);
  } catch (e) {
    // Not loading chat should not affect the User
    // using the rest of the application
    console.error(e);
  }

  return <></>;
};
