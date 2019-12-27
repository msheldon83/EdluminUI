import { Divider, makeStyles } from "@material-ui/core";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo, useState, useCallback } from "react";
import { GetUpcomingAssignments } from "../../../pages/sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentRow } from "../assignment-row";
import { NoAssignment } from "../assignment-row/no-assignment";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { CancelAssignment } from "ui/components/absence/graphql/cancel-assignment.gen";

type Props = {
  userId?: string;
  date: Date;
  isAdmin: boolean;
};

export const NowViewingAssignmentsForDate: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [showingMore, setShowingMore] = useState(false);

  /* TODO change mutation to cancelVacancyDetail. This component breaks them up
     so we only want to cancel the individual piece of the assignment */
  const [cancelAssignment] = useMutationBundle(CancelAssignment);

  const onCancel = useCallback(
    async (id: number, rowVersion: string) => {
      await cancelAssignment({
        variables: {
          cancelRequest: {
            id,
            rowVersion,
          },
        },
      });
    },
    [cancelAssignment]
  );

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
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

  return (
    <div>
      {firstAssignment ? (
        <AssignmentRow
          key={firstAssignment.id}
          assignment={firstAssignment}
          onCancel={onCancel}
          isAdmin={props.isAdmin}
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
