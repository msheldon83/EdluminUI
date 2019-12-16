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

                return (
                  <div key={i} className={periodClasses.join(" ")}>
                    {!p.skipped && (
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
                            >
                              <div
                                className={
                                  !p.isHalfDayMorningEnd
                                    ? props.scheduleClasses.hidden
                                    : ""
                                }
                              >
                                <Chip
                                  tabIndex={-1}
                                  className={classes.endOfMorningChip}
                                  label={t("End of morning")}
                                />
                              </div>
                            </div>
                          );
                        }}
                      </Draggable>
                    )}
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
};

const useStyles = makeStyles(theme => ({
  endOfMorningChip: {
    background: "#FCE7E7",
    color: "#E53935",
    cursor: "grab",
  },
  endOfMorning: {
    flexGrow: 2,
    textAlign: "left",
    paddingLeft: theme.spacing(),
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

  console.log("MORNING", source, destination);

  if (periods[destination.index].skipped) {
    // Should not be able to assign anything to a Skipped period
    return null;
  }

  if (!draggableId.startsWith(endOfMorningDragPrefix)) {
    // Shouldn't occur, but just to be safe
    return null;
  }

  // Find index of Start Of Afternoon
  const startOfAfternoonIndex = periods.findIndex(
    p => p.isHalfDayAfternoonStart
  );
  if (destination.index >= startOfAfternoonIndex) {
    // End of Morning cannot be after Start of Afternoon, but they can be the same
    periods[startOfAfternoonIndex].isHalfDayMorningEnd = true;
  } else {
    periods[destination.index].isHalfDayMorningEnd = true;
  }
  // Clear out the old End of Morning flag
  periods[source.index].isHalfDayMorningEnd = false;

  return periods;
};
