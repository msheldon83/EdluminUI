import * as React from "react";
import { Redirect } from "react-router-dom";
import { GetUserAccess } from "ui/pages/index/UserAccess.gen";
import { useQueryBundle } from "graphql/hooks";

export const IndexPage: React.FunctionComponent = props => {
  const getUserAccess = useQueryBundle(GetUserAccess);

  if (getUserAccess.state === "LOADING") {
    return <></>;
  }

  const userAccess = getUserAccess.data.userAccess?.me;

  return (
    <>
      {userAccess?.isSystemAdministrator &&
        <Redirect to="/admin/organizations" />}
        //TODO handle other roles
    </>
  );
};
