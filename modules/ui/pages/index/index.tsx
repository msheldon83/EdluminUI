import * as React from "react";
import { Redirect } from "react-router-dom";
import { GetUserAccess } from "ui/pages/index/UserAccess.gen";
import { useQueryBundle } from "graphql/hooks";

export const IndexPage: React.FunctionComponent = props => {
  const getUserAccess = useQueryBundle(GetUserAccess);
  console.log(getUserAccess);

  if (getUserAccess.state === "LOADING") {
    return <></>;
  }
  
  if (
    !getUserAccess.data ||
    !getUserAccess.data.userAccess ||
    !getUserAccess.data.userAccess.me ||
    !getUserAccess.data.userAccess.me.user
  ) {
    return <div>oh no</div>;
  }  
    
  return (
    <>
      {getUserAccess.data.userAccess.me.isSystemAdministrator &&
        <Redirect to="/admin/organizations" />}
    </>
  );
};
