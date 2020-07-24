import * as React from "react";
import { getCannyToken } from "./canny-token";
import { getOrgIdFromRoute } from "core/org-context";

type Props = {};

export const Feedback: React.FC<Props> = props => {
  const boardToken = "19363ddd-79d1-a5ca-a326-8f9bac3faa36"; //todo:  from config?

  const isAuthorized = true;
  if (!isAuthorized) {
    return (
      <>
        <h1>Render unauthorized stuff here</h1>
      </>
    );
  }

  interface Window {
    [key: string]: any; // Add index signature
  }

  const orgId = getOrgIdFromRoute();
  if (!orgId) return <></>; //todo:  something with some actual content here?

  const ssoToken = getCannyToken();

  if (!ssoToken) {
    console.log("returning empty");
    return <></>;
  }

  const basePath = "/admin/" + orgId + "/feedback";
  if (typeof window["cannyInit"] === "function") {
    window["cannyInit"](boardToken, basePath, ssoToken);
  }

  return (
    <>
      <h4>Interested in feedback on Red Rover, or have some for us?</h4>
      <div data-canny />
    </>
  );
};
