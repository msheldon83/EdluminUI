import { addDays } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useMemo } from "react";
import { GetUpcomingAssignments } from "./graphql/get-upcoming-assignments.gen";
import { compact } from "lodash-es";
import { UpcomingAssignments } from "./upcoming-assignments";
import { AvailableAssignments } from "./available-assignments";
import { useMyUserAccess } from "reference-data/my-user-access";
import { isAfter, parseISO, startOfWeek } from "date-fns";

export const SubHome: React.FC<{}> = () => {
  const now = useMemo(() => new Date(), []);
  const fromDate = useMemo(() => startOfWeek(now), [now]);
  const toDate = useMemo(() => addDays(now, 30), [now]);

  const userAccess = useMyUserAccess();

  const orgUsers = compact(userAccess?.me?.user?.orgUsers) ?? [];
  const userId = userAccess?.me?.user?.id;

  const getAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: userId ?? "",
      fromDate,
      toDate,
      includeCompletedToday: true,
    },
    skip: !userId,
  });

  const [completedAssignments, upcomingAssignments] = useMemo(() => {
    const assignments =
      getAssignments.state === "LOADING"
        ? []
        : compact(getAssignments.data?.employee?.employeeAssignmentSchedule) ??
          [];

    const firstFutureIndex = assignments.findIndex(a =>
      isAfter(parseISO(a.endTimeLocal), now)
    );
    if (firstFutureIndex == -1) return [assignments, []];
    return [
      assignments.slice(0, firstFutureIndex),
      assignments.slice(firstFutureIndex),
    ];
  }, [getAssignments, now]);

  const onRefetchAssignments = async () => {
    await getAssignments.refetch();
  };

  return (
    <>
      {getAssignments.state !== "LOADING" && (
        <UpcomingAssignments
          userId={userId}
          completedAssignments={completedAssignments}
          upcomingAssignments={upcomingAssignments}
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
