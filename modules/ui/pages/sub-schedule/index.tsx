import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { QueryOrgUsers } from "ui/pages/sub-home/graphql/get-orgusers.gen";

type Props = {};

export const SubSchedule: React.FC<Props> = props => {
  const getOrgUsers = useQueryBundle(QueryOrgUsers, {
    fetchPolicy: "cache-first",
  });

  const userId =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user?.id;

  return <></>;
};
