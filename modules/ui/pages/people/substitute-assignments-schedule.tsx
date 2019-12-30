import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { SubstituteAssignments } from "ui/components/substitutes/substitute-assignments";
import {
  SubstituteAssignmentScheduleCalendarViewRoute,
  SubstituteAssignmentScheduleListViewRoute,
  SubstituteAssignmentScheduleRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useQueryBundle } from "graphql/hooks";
import { GetSubstituteById } from "./graphql/substitute/get-substitute-by-id.gen";
import { PeopleRoute } from "ui/routes/people";
import { Redirect } from "react-router";

type Props = {
  view: "list" | "calendar";
};

export const SubstituteAssignmentsSchedulePage: React.FC<Props> = props => {
  const classes = useStyles();
  const params = useRouteParams(SubstituteAssignmentScheduleRoute);

  const getSubstitute = useQueryBundle(GetSubstituteById, {
    variables: { id: params.orgUserId },
  });

  const orgUser =
    getSubstitute.state === "LOADING"
      ? undefined
      : getSubstitute?.data?.orgUser?.byId;

  if (getSubstitute.state === "LOADING") {
    return <></>;
  }

  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  return (
    <div className={classes.pageContainer}>
      {orgUser && (
        <SubstituteAssignments
          view={props.view}
          pageTitle={`${orgUser?.substitute!.firstName} ${
            orgUser?.substitute!.lastName
          }'s Schedule`}
          userId={orgUser?.userId!.toString()}
          listViewRoute={SubstituteAssignmentScheduleListViewRoute.generate(
            params
          )}
          calendarViewRoute={SubstituteAssignmentScheduleCalendarViewRoute.generate(
            params
          )}
          orgId={orgUser?.substitute!.orgId.toString()}
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
    position: "fixed",
    paddingRight: theme.spacing(3),
  },
}));
