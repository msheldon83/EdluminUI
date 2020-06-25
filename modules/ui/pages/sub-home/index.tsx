import { addDays } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useMemo } from "react";
import { GetUpcomingAssignments } from "./graphql/get-upcoming-assignments.gen";
import { compact } from "lodash-es";
import { UpcomingAssignments } from "./upcoming-assignments";
import { AvailableAssignments } from "./available-assignments";
import { useMyUserAccess } from "reference-data/my-user-access";

export const SubHome: React.FC<{}> = () => {
  const fromDate = useMemo(() => new Date(), []);
  const toDate = useMemo(() => addDays(fromDate, 30), [fromDate]);

  const userAccess = useMyUserAccess();

  const orgUsers = compact(userAccess?.me?.user?.orgUsers) ?? [];
  const userId = userAccess?.me?.user?.id;

  const getUpcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: userId ?? "",
      fromDate,
      toDate,
      includeCompletedToday: false,
    },
    skip: !userId,
  });

  const assignments = useMemo(
    () =>
      getUpcomingAssignments.state === "LOADING"
        ? []
        : compact(
            getUpcomingAssignments.data?.employee?.employeeAssignmentSchedule
          ) ?? [],
    [getUpcomingAssignments]
  );

  const onRefetchAssignments = async () => {
    await getUpcomingAssignments.refetch();
  };

  return (
    <>
      {getUpcomingAssignments.state !== "LOADING" && (
        <UpcomingAssignments
          userId={userId}
          assignments={assignments}
          actingAsSubstitute={true}
        />
      )}
      <AvailableAssignments
        userId={userId}
        orgUsers={orgUsers}
        refetchAssignments={onRefetchAssignments}
      />
    </>
  );
};
