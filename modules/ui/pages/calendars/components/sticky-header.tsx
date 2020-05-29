import * as React from "react";
import { CalendarChangeRow } from "./calendarChangeRow";
import { CalendarChange } from "graphql/server-types.gen";
import { useMemo, useState, useCallback } from "react";
import { Divider, makeStyles } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { CalendarEvent } from "../types";

type Props = {
  orgId: string;
  calendarChange: CalendarEvent;
  onDelete: (calendarChangeId: string) => void;
  date: Date;
};

export const StickyHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [showingMore, setShowingMore] = useState(false);

  if (!props.calendarChange) {
    //return <></>;
  }

  return (
    <div>
      <CalendarChangeRow
        orgId={props.orgId}
        calendarChange={props.calendarChange}
        onDelete={props.onDelete}
        date={props.date}
      ></CalendarChangeRow>
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
