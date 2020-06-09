import * as React from "react";
import { CalendarChangeRow } from "./calendarChangeRow";
import { CalendarChange } from "graphql/server-types.gen";
import { useMemo, useState, useCallback } from "react";
import { Divider, makeStyles } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { CalendarEvent } from "../types";
import { EditSignleDayDialog } from "./edit-single-day-dialog";

type Props = {
  orgId: string;
  calendarChange: CalendarEvent;
  onDelete: (calendarChangeId: string, date?: Date) => void;
  onAdd: (date: string) => void;
  onEdit: (calendarChange: CalendarEvent, date?: Date) => void;
  date: Date;
};

export const StickyHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [showingMore, setShowingMore] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogForDelete, setDialogForDelete] = useState(false);

  if (!props.calendarChange) {
    //return <></>;
  }

  const handleOnEdit = (calendarChange: CalendarEvent, date?: Date) => {
    if (calendarChange.startDate !== calendarChange.endDate) {
      setEditDialogOpen(true);
    } else {
      props.onEdit(calendarChange, date);
    }
  };

  const handleOnDelete = (calendarChange: CalendarEvent, date?: Date) => {
    if (calendarChange.startDate !== calendarChange.endDate) {
      setDialogForDelete(true);
      setEditDialogOpen(true);
    } else {
      props.onDelete(calendarChange.id!, date);
    }
  };

  return (
    <div>
      <EditSignleDayDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
        }}
        onEditDay={() => {
          setEditDialogOpen(false);
          props.onEdit(props.calendarChange, props.date);
        }}
        onEditEvent={() => {
          setEditDialogOpen(false);
          props.onEdit(props.calendarChange);
        }}
        onDeleteDay={() => {
          setDialogForDelete(false);
          setEditDialogOpen(false);
          props.onDelete(props.calendarChange?.id!, props.date);
        }}
        onDeleteEvent={() => {
          setDialogForDelete(false);
          setEditDialogOpen(false);
          props.onDelete(props.calendarChange?.id!);
        }}
        date={props.date}
        forDelete={dialogForDelete}
      />
      <CalendarChangeRow
        orgId={props.orgId}
        calendarChange={props.calendarChange}
        onDelete={handleOnDelete}
        date={props.date}
        onAdd={props.onAdd}
        onEdit={handleOnEdit}
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
