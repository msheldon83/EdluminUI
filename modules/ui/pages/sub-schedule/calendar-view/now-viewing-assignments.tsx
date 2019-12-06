import { Divider, makeStyles, Button } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo, useState } from "react";
import { GetUpcomingAssignments } from "../../sub-home/graphql/get-upcoming-assignments.gen";
import { AssignmentRow } from "../assignment-row";
import { NoAssignment } from "../assignment-row/no-assignment";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";

type Props = {
  userId?: string;
  date: Date;
};

export const NowViewingAssignmentsForDate: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [showingMore, setShowingMore] = useState(false);

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
    <div className={classes.container}>
      {firstAssignment ? (
        <AssignmentRow
          key={firstAssignment.id}
          assignment={firstAssignment}
          onCancel={() =>
            console.log("cancel assignment", firstAssignment.assignment?.id)
          }
        />
      ) : (
        <NoAssignment date={props.date} />
      )}
      <Divider />

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
            {otherAssignments &&
              otherAssignments.map((a, i) => (
                <>
                  <AssignmentRow
                    key={a.id || i}
                    assignment={a}
                    onCancel={() =>
                      console.log("cancel assignment", a.assignment?.id)
                    }
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
  container: {
    marginBottom: theme.spacing(2),
  },
  moreOrLess: {
    textTransform: "none",
    textDecoration: "underline",
    fontSize: theme.typography.pxToRem(14),
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));
