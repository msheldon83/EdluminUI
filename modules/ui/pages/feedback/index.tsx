import * as React from "react";
import { getCannyToken } from "./canny-token";
import { getOrgIdFromRoute } from "core/org-context";
import { ErrorUI } from "../../components/error";
import { useTranslation } from "react-i18next";

type Props = {};

export const Feedback: React.FC<Props> = props => {
  const { t } = useTranslation();
  const boardToken = "19363ddd-79d1-a5ca-a326-8f9bac3faa36";

  const isAuthorized = true;
  if (!isAuthorized) {
    return (
      <>
        <h1>Render unauthorized stuff here</h1>
      </>
    );
  }

  const orgId = getOrgIdFromRoute();
  if (!orgId) return <></>; //todo:  something with some actual content here?

  const ssoToken = getCannyToken();

  if (!ssoToken) {
    return <></>;
  }

  const basePath = "/admin/" + orgId + "/feedback";
  try {
    Canny("render", {
      boardToken: boardToken,
      basePath: basePath,
      ssoToken: ssoToken,
    });
  } catch (e) {
    console.log("cat error");
    return <ErrorUI />;
  }

  return (
    <>
      <h4>
        {t(
          "Have some feedback that you'd like to share with the team at Red Rover?  Feel free to post your idea here! We'd also love for you to vote and comment on ideas that you find compelling. We genuinely appreciate your partnership."
        )}
      </h4>
      <div data-canny />
    </>
  );
};
