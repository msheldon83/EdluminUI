import * as React from "react";
import { getCannyToken } from "./canny-token";
import { getOrgIdFromRoute } from "core/org-context";
import { ErrorUI } from "../../components/error";
import { useTranslation } from "react-i18next";
import { UnauthorizedAdminRoleRoute } from "../../../ui/routes/unauthorized";
import { useQueryBundle } from "graphql/hooks";
import { GetCannyToken } from "./graphql/get-canny-token.gen";
import { Redirect } from "react-router-dom";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {};

export const Feedback: React.FC<Props> = props => {
  const { t } = useTranslation();
  const boardToken = "19363ddd-79d1-a5ca-a326-8f9bac3faa36";

  const orgId = getOrgIdFromRoute();
  if (!orgId) return <></>; //todo:  something with some actual content here?

  const showFeedbackMenuLink = () => {
    const userAccess = useMyUserAccess();
    const orgUsers = userAccess?.me?.user?.orgUsers;
    if (!orgUsers) return false;
    return (
      orgUsers.filter(function(orgUser) {
        return orgUser?.administrator?.isSuperUser;
      }).length > 0
    );
  };

  if (!showFeedbackMenuLink) {
    return (
      <Redirect
        to={UnauthorizedAdminRoleRoute.generate({
          organizationId: orgId ?? "",
        })}
      />
    );
  }

  //  const ssoToken = getCannyToken();

  const getToken = useQueryBundle(GetCannyToken, {
    fetchPolicy: "network-only",
  });

  const ssoToken = React.useMemo(() => {
    if (getToken.state === "DONE") {
      return getToken?.data?.userAccess?.cannyToken;
    }
    return null;
  }, [getToken.state]);

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
