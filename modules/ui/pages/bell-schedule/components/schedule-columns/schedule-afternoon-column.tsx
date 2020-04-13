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

const startOfAfternoonDragPrefix = "startOfAfternoonDrag-";

export const ScheduleAfternoonColumn: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <DragDropContext
        onDragEnd={(result: DropResult) => {
          const updatedPeriods = onDragEnd(result, props.periods);
          if (updatedPeriods) {
            props.setPeriods(updatedPeriods);
          }
        }}
      >
        <Droppable droppableId="startOfAfternoonDroppable">
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

                  const startOfAfternoonDiv = (
                    <div
                      className={
                        !p.isHalfDayAfternoonStart
                          ? props.scheduleClasses.hidden
                          : ""
                      }
                    >
                      <Chip
                        tabIndex={-1}
                        className={classes.startOfAfternoonChip}
                        label={t("Start of afternoon")}
                      />
                    </div>
                  );

                  return (
                    <div key={i} className={periodClasses.join(" ")}>
                      {!p.skipped && (
                        <>
                          <Can do={[PermissionEnum.ScheduleSettingsSave]}>
                            <Draggable
                              key={`${startOfAfternoonDragPrefix}${i}`}
                              draggableId={`${startOfAfternoonDragPrefix}${i}`}
                              index={i}
                              isDragDisabled={!p.isHalfDayAfternoonStart}
                            >
                              {(provided, snapshot) => {
                                const { innerRef } = provided;
                                return (
                                  <div
                                    ref={innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={classes.startOfAfternoon}
                                    style={{
                                      ...provided.draggableProps.style,
                                      position: snapshot.isDragging
                                        ? "static"
                                        : undefined,
                                    }}
                                  >
                                    {startOfAfternoonDiv}
                                  </div>
                                );
                              }}
                            </Draggable>
                          </Can>
                          <Can not do={[PermissionEnum.ScheduleSettingsSave]}>
                            <div className={classes.startOfAfternoon}>
                              {startOfAfternoonDiv}
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
    </>
  );
};

const useStyles = makeStyles(theme => ({
  startOfAfternoon: {
    flexGrow: 2,
    textAlign: "right",
    paddingRight: theme.spacing(),
  },
  startOfAfternoonChip: {
    background: "#ECF9F3",
    color: "#00C853",
    cursor: "grab",
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

  if (!draggableId.startsWith(startOfAfternoonDragPrefix)) {
    // Shouldn't occur, but just to be safe
    return null;
  }

  // Find index of End Of Morning. Start of Afternoon cannot be before End of Morning, but they can be the same.
  const endOfMorningIndex = periods.findIndex(p => p.isHalfDayMorningEnd);
  const destinationIndex =
    destination.index <= endOfMorningIndex
      ? endOfMorningIndex
      : destination.index;
  periods[destinationIndex].isHalfDayAfternoonStart = true;
  if (destinationIndex != source.index) {
    // Clear out the old Start of Afternoon flag if we made a move
    periods[source.index].isHalfDayAfternoonStart = false;
  }

  return periods;
};
