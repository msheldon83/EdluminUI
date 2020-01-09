import * as React from "react";
import { CalendarChangeRow } from "./calendarChangeRow";
import { CalendarChange } from "graphql/server-types.gen";
import { useMemo, useState, useCallback } from "react";
import { Divider, makeStyles } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";

type Props = {
  orgId: string;
  calendarChanges: CalendarChange[];
  onDelete: (calendarChangeId: string) => void;
  date: Date;
};

export const StickyHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [showingMore, setShowingMore] = useState(false);

  const ableToShowMore =
    props.calendarChanges && props.calendarChanges.length > 1;
  const moreCount = props.calendarChanges && props.calendarChanges.length - 1;
  const firstCalendarChange = props.calendarChanges && props.calendarChanges[0];
  const otherCalendarChanges =
    props.calendarChanges &&
    props.calendarChanges.length > 1 &&
    props.calendarChanges.slice(1);
  if (!props.calendarChanges) {
    //return <></>;
  }

  return (
    <div>
      <CalendarChangeRow
        orgId={props.orgId}
        calendarChange={firstCalendarChange}
        onDelete={props.onDelete}
        date={props.date}
      ></CalendarChangeRow>
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
            {otherCalendarChanges &&
              otherCalendarChanges.map((c, i) => (
                <>
                  <CalendarChangeRow
                    orgId={props.orgId}
                    calendarChange={c}
                    onDelete={props.onDelete}
                    date={props.date}
                  ></CalendarChangeRow>
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
