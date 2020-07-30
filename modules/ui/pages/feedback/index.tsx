import * as React from "react";
import { ErrorUI } from "../../components/error";
import { useTranslation } from "react-i18next";
import { UnauthorizedAdminRoleRoute } from "../../../ui/routes/unauthorized";
import { useQueryBundle } from "graphql/hooks";
import { GetCannyToken } from "./graphql/get-canny-token.gen";
import { Redirect } from "react-router-dom";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useOrganizationId } from "core/org-context";
import Typography from "@material-ui/core/Typography";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {};

export const Feedback: React.FC<Props> = props => {
  const { t } = useTranslation();
  const boardToken = "19363ddd-79d1-a5ca-a326-8f9bac3faa36";
  const { openSnackbar } = useSnackbar();

  const orgId = useOrganizationId();

  const userAccess = useMyUserAccess();
  const isSuperUserInAnyOrg = React.useMemo(() => {
    const orgUsers = userAccess?.me?.user?.orgUsers;
    if (!orgUsers) return false;
    return (
      orgUsers.filter(function(orgUser) {
        return orgUser?.administrator?.isSuperUser;
      }).length > 0
    );
  }, [userAccess]);

  if (!userAccess) {
    return <></>;
  }
  if (!isSuperUserInAnyOrg) {
    return (
      <Redirect
        to={UnauthorizedAdminRoleRoute.generate({
          organizationId: orgId ?? "",
        })}
      />
    );
  }

  const getToken = useQueryBundle(GetCannyToken, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    fetchPolicy: "network-only",
  });

  const ssoToken = React.useMemo(() => {
    if (getToken.state === "DONE") {
      return getToken?.data?.userAccess?.cannyToken;
    }
    return null;
  }, [getToken.state]);

  if (!ssoToken && getToken.state === "DONE") {
    return <ErrorUI />;
  }

  if (!ssoToken) {
    return <></>;
  }

  const basePath = `/admin/${orgId}/feedback`;
  try {
    const canny = (window as any).Canny;
    if (!canny) {
      return <ErrorUI />;
    }

    canny("render", {
      boardToken: boardToken,
      basePath: basePath,
      ssoToken: ssoToken,
    });
  } catch (e) {
    return <ErrorUI />;
  }

  return (
    <>
      <Typography variant="h6">
        {t(
          "Have some feedback that you'd like to share with the team at Red Rover?  Feel free to post your idea here! We'd also love for you to vote and comment on ideas that you find compelling. We genuinely appreciate your partnership."
        )}
      </Typography>
      <br />
      <div data-canny />
    </>
  );
};
