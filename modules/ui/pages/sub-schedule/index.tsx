import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  SubScheduleCalendarViewRoute,
  SubScheduleListViewRoute,
  SubScheduleRoute,
} from "ui/routes/sub-schedule";
import { SubstituteAssignments } from "ui/components/substitutes/substitute-assignments";
import { useMemo } from "react";
import { parseISO } from "date-fns";

type Props = {
  view: "list" | "calendar";
};

export const SubSchedule: React.FC<Props> = props => {
  const classes = useStyles();
  const params = useRouteParams(SubScheduleRoute);

  const getOrgUsers = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  const user =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user;

  const userCreatedDate = useMemo(() => {
    if (!user || !user.createdUtc) {
      return undefined;
    }

    const userCreatedDate = parseISO(user.createdUtc);
    return userCreatedDate;
  }, [user]);

  return (
    <div>
      {user?.id && userCreatedDate && (
        <SubstituteAssignments
          view={props.view}
          pageTitle={"My Schedule"}
          userId={user.id}
          listViewRoute={SubScheduleListViewRoute.generate(params)}
          calendarViewRoute={SubScheduleCalendarViewRoute.generate(params)}
          isAdmin={false}
          userCreatedDate={userCreatedDate}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({}));
