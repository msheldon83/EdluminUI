import * as React from "react";
import { Period, UpdatePeriodPlaceholders } from "../../helpers";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import { TFunction } from "i18next";
import { DragHandle } from "@material-ui/icons";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

type Props = {
  periods: Period[];
  isStandard: boolean;
  setPeriods: (periods: Period[]) => void;
  setFieldValue: Function;
  scheduleClasses: any;
};

const nameDragPrefix = "nameDrag-";

export const ScheduleNamesColumn: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <DragDropContext
        onDragEnd={(result: DropResult) => {
          const updatedPeriods = onDragEnd(result, props.periods, t);
          if (updatedPeriods) {
            props.setPeriods(updatedPeriods);
          }
        }}
      >
        <Droppable droppableId="nameDroppable">
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
                      <Can do={[PermissionEnum.ScheduleSettingsSave]}>
                        <Draggable
                          key={`${nameDragPrefix}${i}`}
                          draggableId={`${nameDragPrefix}${i}`}
                          index={i}
                          isDragDisabled={p.skipped}
                        >
                          {(provided, snapshot) => {
                            const { innerRef } = provided;
                            return (
                              <div
                                ref={innerRef}
                                {...provided.draggableProps}
                                className={classes.draggableSection}
                                style={{
                                  ...provided.draggableProps.style,
                                  position: snapshot.isDragging
                                    ? "static"
                                    : undefined,
                                }}
                              >
                                <div className={classes.nameInput}>
                                  {props.isStandard && (
                                    <FormTextField
                                      inputProps={{
                                        tabIndex: i + 1,
                                      }}
                                      placeholder={p.placeholder}
                                      value={p.name || ""}
                                      name={`periods[${i}].name`}
                                      variant="outlined"
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                      ) => {
                                        props.setFieldValue(
                                          `periods[${i}].name`,
                                          e.target.value
                                        );
                                      }}
                                    />
                                  )}
                                  {!props.isStandard && p.name}
                                </div>
                                <div
                                  className={classes.actionDiv}
                                  {...provided.dragHandleProps}
                                  tabIndex={-1}
                                >
                                  {props.periods.length > 1 && !p.skipped && (
                                    <DragHandle />
                                  )}
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      </Can>
                      <Can not do={[PermissionEnum.ScheduleSettingsSave]}>
                        <div className={classes.nameDisplay}>{p.name}</div>
                      </Can>
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
  nameInput: {
    width: theme.typography.pxToRem(200),
    margin: theme.spacing(),
  },
  nameDisplay: {
    marginLeft: theme.spacing(2),
  },
  draggableSection: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  actionDiv: {
    width: theme.typography.pxToRem(50),
  },
}));

const onDragEnd = (
  result: DropResult,
  periods: Period[],
  t: TFunction
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
    // Should not be able to swap names with a Skipped Period
    return null;
  }

  if (!draggableId.startsWith(nameDragPrefix)) {
    // Shouldn't occur, but just to be safe
    return null;
  }

  // Just reordering the names of the periods
  const oldPeriods = periods.map(p => {
    return { ...p };
  });
  if (source.index < destination.index) {
    // Dragging down the list
    for (let i = destination.index - 1; i >= source.index; i--) {
      periods[i].name = oldPeriods[i + 1].name;
    }
  } else {
    // Dragging up the list
    for (let i = destination.index + 1; i <= source.index; i++) {
      periods[i].name = oldPeriods[i - 1].name;
    }
  }
  // Update the destination name that was actually dragged
  periods[destination.index].name = oldPeriods[source.index].name;

  // Update placeholders
  UpdatePeriodPlaceholders(periods, t);

  return periods;
};
