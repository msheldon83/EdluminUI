import * as React from "react";
import { AvailableAssignments } from "ui/pages/sub-home/available-assignments";
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
      <AvailableAssignments viewingAsAdmin={true} userId={user.userId} />
    </>
  );
};
