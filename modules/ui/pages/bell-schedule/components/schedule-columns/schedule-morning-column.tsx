import * as React from "react";
import { Period } from "../../helpers";
import { makeStyles, Chip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

type Props = {
  periods: Period[];
  setPeriods: (periods: Period[]) => void;
  scheduleClasses: any;
};

const endOfMorningDragPrefix = "endOfMorningDrag-";

export const ScheduleMorningColumn: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <DragDropContext
      onDragEnd={(result: DropResult) => {
        const updatedPeriods = onDragEnd(result, props.periods);
        if (updatedPeriods) {
          props.setPeriods(updatedPeriods);
        }
      }}
    >
      <Droppable droppableId="endOfMorningDroppable">
        {(provided, snapshot) => {
          const { innerRef } = provided;

          return (
            <div ref={innerRef} {...provided.droppableProps}>
              {props.periods.map((p, i) => {
                const periodClasses = [props.scheduleClasses.period];
                if (i % 2 === 1) {
                  periodClasses.push(props.scheduleClasses.alternatingItem);
                }
                if (p.skipped) {
                  periodClasses.push(props.scheduleClasses.skippedPeriod);
                }

                const endOfMorningDiv = (
                  <div
                    className={
                      !p.isHalfDayMorningEnd ? props.scheduleClasses.hidden : ""
                    }
                  >
                    <Chip
                      tabIndex={-1}
                      className={classes.endOfMorningChip}
                      label={t("End of morning")}
                    />
                    {provided.placeholder}
                  </div>
                );

                return (
                  <div key={i} className={periodClasses.join(" ")}>
                    {!p.skipped && (
                      <>
                        <Can do={[PermissionEnum.ScheduleSettingsSave]}>
                          <Draggable
                            key={`${endOfMorningDragPrefix}${i}`}
                            draggableId={`${endOfMorningDragPrefix}${i}`}
                            index={i}
                            isDragDisabled={!p.isHalfDayMorningEnd}
                          >
                            {(provided, snapshot) => {
                              const { innerRef } = provided;

                              return (
                                <div
                                  ref={innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={classes.endOfMorning}
                                  style={{
                                    ...provided.draggableProps.style,
                                    position: snapshot.isDragging
                                      ? "static"
                                      : undefined,
                                  }}
                                >
                                  {endOfMorningDiv}
                                </div>
                              );
                            }}
                          </Draggable>
                        </Can>
                        <Can not do={[PermissionEnum.ScheduleSettingsSave]}>
                          <div className={classes.endOfMorning}>
                            {endOfMorningDiv}
                          </div>
                        </Can>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
};

/*
  Note: the droppable item jumps when dropped because of a bug in react-beautiful-dnd
  not correctly handling flex items with `align-items: center` set.

  https://github.com/atlassian/react-beautiful-dnd/issues/1851
*/

const useStyles = makeStyles(theme => ({
  endOfMorningChip: {
    background: "#FCE7E7",
    color: "#E53935",
    cursor: "grab",

    "&:active": {
      cursor: "grabbing",
    },
  },
  endOfMorning: {
    textAlign: "left",
  },
}));

const onDragEnd = (
  result: DropResult,
  periods: Array<Period>
): Array<Period> | null => {
  const { destination, source, draggableId } = result;

  if (!destination) {
    return null;
  }
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return null;
  }

  if (periods[destination.index].skipped) {
    // Should not be able to assign anything to a Skipped period
    return null;
  }

  if (!draggableId.startsWith(endOfMorningDragPrefix)) {
    // Shouldn't occur, but just to be safe
    return null;
  }

  // Find index of Start Of Afternoon. End of Morning cannot be after Start of Afternoon, but they can be the same
  const startOfAfternoonIndex = periods.findIndex(
    p => p.isHalfDayAfternoonStart
  );
  const destinationIndex =
    destination.index >= startOfAfternoonIndex
      ? startOfAfternoonIndex
      : destination.index;
  periods[destinationIndex].isHalfDayMorningEnd = true;
  if (destinationIndex != source.index) {
    // Clear out the old End of Morning flag if we made a move
    periods[source.index].isHalfDayMorningEnd = false;
  }

  return periods;
};
