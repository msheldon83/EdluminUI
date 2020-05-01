import * as React from "react";
import { AvailableAssignments } from "ui/pages/sub-home/available-assignments";
import { useRouteParams } from "ui/routes/definition";
import { SubstituteAvailableAssignmentsRoute } from "ui/routes/people";
import { useQueryBundle } from "graphql/hooks";
import { GetOrgUserById } from "./graphql/get-orguser-by-id.gen";
import { PersonLinkHeader } from "ui/components/link-headers/person";

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
      <PersonLinkHeader
        title={`${user.firstName} ${user.lastName}`}
        params={params}
      />
      <AvailableAssignments viewingAsAdmin={true} userId={user.userId} />
    </>
  );
};
