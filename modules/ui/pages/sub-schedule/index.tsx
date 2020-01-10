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

type Props = {
  view: "list" | "calendar";
};

export const SubSchedule: React.FC<Props> = props => {
  const classes = useStyles();
  const params = useRouteParams(SubScheduleRoute);

  const getOrgUsers = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  const userId =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user?.id;

  return (
    <div className={classes.pageContainer}>
      {userId && (
        <SubstituteAssignments
          view={props.view}
          pageTitle={"My Schedule"}
          userId={userId}
          listViewRoute={SubScheduleListViewRoute.generate(params)}
          calendarViewRoute={SubScheduleCalendarViewRoute.generate(params)}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  pageContainer: {
    display: "block",
    overflowY: "scroll",
    height: "100vh",
  },
}));
