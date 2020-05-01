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
import { useMemo } from "react";
import { parseISO } from "date-fns";
import { PersonLinkHeader } from "ui/components/link-headers/person";

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

  const orgUserCreatedDate = useMemo(() => {
    if (!orgUser || !orgUser.createdUtc) {
      return undefined;
    }

    const orgUserCreatedDate = parseISO(orgUser.createdUtc);
    return orgUserCreatedDate;
  }, [orgUser]);

  if (getSubstitute.state === "LOADING") {
    return <></>;
  }

  if (!orgUser) {
    // Redirect the User back to the List page
    const listUrl = PeopleRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  return (
    <div>
      {orgUser && orgUserCreatedDate && (
        <SubstituteAssignments
          view={props.view}
          pageTitle={
            <PersonLinkHeader
              title={`${orgUser?.substitute!.firstName} ${
                orgUser?.substitute!.lastName
              }'s Schedule`}
              person={orgUser?.substitute!}
              params={params}
            />
          }
          userId={orgUser?.userId!.toString()}
          listViewRoute={SubstituteAssignmentScheduleListViewRoute.generate(
            params
          )}
          calendarViewRoute={SubstituteAssignmentScheduleCalendarViewRoute.generate(
            params
          )}
          orgId={orgUser?.substitute!.orgId.toString()}
          viewingAsAdmin={true}
          userCreatedDate={orgUserCreatedDate}
        />
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({}));
