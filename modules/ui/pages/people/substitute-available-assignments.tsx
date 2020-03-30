import * as React from "react";
import { SubHome } from "ui/pages/sub-home";
import { useRouteParams } from "ui/routes/definition";
import { SubstituteAvailableAssignmentsRoute } from "ui/routes/people";
import { useQueryBundle } from "graphql/hooks";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { PageTitle } from "ui/components/page-title";

export const SubstituteAvailableAssignmentsPage: React.FC<{}> = () => {
  const params = useRouteParams(SubstituteAvailableAssignmentsRoute);

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
  });

  const user =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  if (!user?.userId) {
    return <></>;
  }

  return (
    <>
      <PageTitle title={`${user.firstName} ${user.lastName}`} />
      <SubHome viewingAsAdmin={true} userId={user.userId} />
    </>
  );
};
