import * as React from "react";
import { Redirect } from "react-router-dom";
import { GetUserAccess } from "ui/pages/index/UserAccess.gen";
import { useQueryBundle } from "graphql/hooks";
import { oc } from 'ts-optchain';

export const IndexPage: React.FunctionComponent = props => {
  const getUserAccess = useQueryBundle(GetUserAccess);
  console.log(getUserAccess);

  if (getUserAccess.state === "LOADING") {
    return <></>;
  }

  const userAccess = oc(getUserAccess).data.userAccess.me;

  return (
    <>
      {userAccess.isSystemAdministrator &&
        <Redirect to="/admin/organizations" />}
        //TODO handle other roles
    </>
  );
};
