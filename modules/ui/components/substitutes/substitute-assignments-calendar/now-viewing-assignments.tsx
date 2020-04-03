import { Divider, makeStyles } from "@material-ui/core";
import {
  useQueryBundle,
  useMutationBundle,
  usePagedQueryBundle,
} from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo, useState, useCallback } from "react";
import { GetUpcomingAssignments } from "../../../pages/sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentRow } from "../assignment-row";
import { NoAssignment } from "../assignment-row/no-assignment";
import { NonWorkDay } from "./non-work-day";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { CancelAssignment } from "ui/components/absence/graphql/cancel-assignment.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { GetUnavilableTimeExceptions } from "ui/pages/sub-availability/graphql/get-unavailable-exceptions.gen";
import { GetMyAvailableTime } from "ui/pages/sub-availability/graphql/get-available-time.gen";
import { getDay } from "date-fns";
import { daysOfWeekOrdered } from "helpers/day-of-week";

type Props = {
  userId?: string;
  orgId?: string;
  date: Date;
  isAdmin: boolean;
};

export const NowViewingAssignmentsForDate: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [showingMore, setShowingMore] = useState(false);
  const { openSnackbar } = useSnackbar();

  /* TODO change mutation to cancelVacancyDetail. This component breaks them up
     so we only want to cancel the individual piece of the assignment */
  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    refetchQueries: [
      "GetAssignmentDatesForSubstitute",
      "GetUpcomingAssignments",
    ],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onCancel = useCallback(
    async (
      assignmentId: string,
      rowVersion: string,
      vacancyDetailIds?: string[]
    ) => {
      await cancelAssignment({
        variables: {
          cancelRequest: {
            assignmentId,
            rowVersion,
            vacancyDetailIds,
          },
        },
      });
    },
    [cancelAssignment]
  );

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
      organizationId: props.orgId ?? null,
      fromDate: props.date,
      toDate: props.date,
      includeCompletedToday: true,
    },
    skip: !props.userId,
  });

  const data = useMemo(() => {
    if (
      upcomingAssignments.state == "DONE" ||
      upcomingAssignments.state == "UPDATING"
    ) {
      return compact(
        upcomingAssignments.data.employee?.employeeAssignmentSchedule
      );
    }
  }, [upcomingAssignments]);

  const [getExceptions, _] = usePagedQueryBundle(
    GetUnavilableTimeExceptions,
    r => r.user?.pagedUserUnavailableTime?.totalCount,
    {
      variables: {
        userId: props.userId ?? "",
        fromDate: props.date,
        toDate: props.date,
      },
      skip: !props.userId,
    }
  );
  const exceptions = useMemo(() => {
    if (
      getExceptions.state === "DONE" &&
      getExceptions.data.user?.pagedUserUnavailableTime?.results
    ) {
      return (
        compact(getExceptions.data.user?.pagedUserUnavailableTime?.results) ??
        []
      );
    }
    return [];
  }, [getExceptions]);

  const getAvailableTime = useQueryBundle(GetMyAvailableTime);
  const regularAvailableTime = useMemo(
    () =>
      getAvailableTime.state === "DONE"
        ? compact(getAvailableTime.data.userAccess?.me?.user?.availableTime) ??
          []
        : [],
    [getAvailableTime]
  );

  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }

  const ableToShowMore = data && data.length > 1;
  const firstAssignment = data && data.length > 0 && data[0];
  const otherAssignments = data && data.length > 1 && data.slice(1);
  const moreCount = data && data.length - 1;

  const availabilityException =
    exceptions && exceptions.length > 0 ? exceptions[0] : null;

  const dow = getDay(props.date);
  const regularException = regularAvailableTime.find(
    x => x?.daysOfWeek[0] === daysOfWeekOrdered[dow]
  );

  return (
    <div>
      {firstAssignment ? (
        <AssignmentRow
          key={firstAssignment.id}
          assignment={firstAssignment}
          onCancel={onCancel}
          isAdmin={props.isAdmin}
        />
      ) : availabilityException || regularException ? (
        <NonWorkDay
          date={props.date}
          availabilityType={
            availabilityException?.availabilityType ??
            regularException?.availabilityType
          }
          time={
            availabilityException?.availableTime ??
            regularException?.availableTime
          }
        />
      ) : (
        <NoAssignment date={props.date} />
      )}

      {ableToShowMore &&
        (!showingMore ? (
          <TextButton
            onClick={() => setShowingMore(true)}
            className={classes.moreOrLess}
          >
            + {moreCount} {t("More")}
          </TextButton>
        ) : (
          <>
            <Divider />
            {otherAssignments &&
              otherAssignments.map((a, i) => (
                <>
                  <AssignmentRow
                    key={a.id || i}
                    assignment={a}
                    onCancel={onCancel}
                    isAdmin={props.isAdmin}
                  />
                  <Divider />
                </>
              ))}
            <TextButton
              onClick={() => setShowingMore(false)}
              className={classes.moreOrLess}
            >
              {t("Show less")}
            </TextButton>
          </>
        ))}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  moreOrLess: {
    textTransform: "none",
    textDecoration: "underline",
    fontSize: theme.typography.pxToRem(14),
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));
