import * as React from "react";
import { CalendarChangeRow } from "./calendarChangeRow";
import { OptionType } from "ui/components/form/select-new";
import { useState } from "react";
import { CalendarEvent } from "../types";
import { EditSignleDayDialog } from "./edit-single-day-dialog";

type Props = {
  orgId: string;
  locationOptions: OptionType[];
  contractOptions: OptionType[];
  calendarChange: CalendarEvent;
  onDelete: (calendarChangeId: string, date?: Date) => Promise<void>;
  onAdd: (date: string) => void;
  onEdit: (calendarChange: CalendarEvent, date?: Date) => void;
  date: Date;
};

export const StickyHeader: React.FC<Props> = props => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogForDelete, setDialogForDelete] = useState(false);

  const handleOnEdit = (calendarChange: CalendarEvent, date?: Date) => {
    if (calendarChange.startDate !== calendarChange.endDate) {
      setEditDialogOpen(true);
    } else {
      props.onEdit(calendarChange, date);
    }
  };

  const handleOnDelete = async (calendarChange: CalendarEvent, date?: Date) => {
    if (calendarChange.startDate !== calendarChange.endDate) {
      setDialogForDelete(true);
      setEditDialogOpen(true);
    } else {
      await props.onDelete(calendarChange.id!, date);
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
        onDeleteDay={async () => {
          if (props.calendarChange?.id) {
            await props.onDelete(props.calendarChange?.id, props.date);
            setDialogForDelete(false);
            setEditDialogOpen(false);
          }
        }}
        onDeleteEvent={async () => {
          if (props.calendarChange?.id) {
            await props.onDelete(props.calendarChange?.id);
            setDialogForDelete(false);
            setEditDialogOpen(false);
          }
        }}
        date={props.date}
        forDelete={dialogForDelete}
      />
      <CalendarChangeRow
        locationOptions={props.locationOptions}
        contractOptions={props.contractOptions}
        orgId={props.orgId}
        calendarChange={props.calendarChange}
        onDelete={handleOnDelete}
        date={props.date}
        onAdd={props.onAdd}
        onEdit={handleOnEdit}
      />
    </div>
  );
};
