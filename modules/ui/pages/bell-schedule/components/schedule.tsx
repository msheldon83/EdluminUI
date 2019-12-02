import { Chip, FormHelperText, makeStyles } from "@material-ui/core";
import { Add, CancelOutlined, DragHandle } from "@material-ui/icons";
import { addMinutes, differenceInMinutes, isValid } from "date-fns";
import { Formik, FormikErrors } from "formik";
import { useIsMobile } from "hooks";
import { TFunction } from "i18next";
import * as React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { TimeInput as TimeInputComponent } from "ui/components/form/time-input";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";

type Props = {
  name?: string | null | undefined;
  isStandard: boolean;
  periods: Array<Period>;
  variantId?: number | null | undefined;
  submitLabel?: string | null | undefined;
  onSubmit: (
    periods: Array<Period>,
    variantId?: number | null | undefined
  ) => void;
  onCancel: () => void;
};

export type Period = {
  periodId?: string | null | undefined;
  variantPeriodId?: string | null | undefined;
  name?: string;
  placeholder: string;
  startTime?: string;
  endTime?: string;
  isHalfDayMorningEnd?: boolean;
  isHalfDayAfternoonStart?: boolean;
  skipped: boolean;
  sequence?: number;
};

const travelDuration = 5;
const minNumberOfPeriods = 2;
const draggablePrefixes = {
  nameDrag: "nameDrag-",
  startOfAfternoonDrag: "startOfAfternoonDrag-",
  endOfMorningDrag: "endOfMorningDrag-",
};

export const Schedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const onDragEnd = (
    result: DropResult,
    periods: Array<Period>,
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

    // Determine the appropriate Period indexes
    const draggableItemsPerPeriod = Object.keys(draggablePrefixes).length;
    let sourceIndex = Math.ceil(source.index / draggableItemsPerPeriod) - 1;
    if (sourceIndex < 0) {
      sourceIndex = 0;
    }
    let destinationIndex =
      Math.ceil(destination.index / draggableItemsPerPeriod) - 1;
    if (destinationIndex < 0) {
      destinationIndex = 0;
    }

    if (periods[destinationIndex].skipped) {
      // Should not be able to assign anything to a Skipper period
      return null;
    }

    if (draggableId.startsWith(draggablePrefixes.nameDrag)) {
      // Just reordering the names of the periods
      const oldPeriods = periods.map(p => {
        return { ...p };
      });
      if (sourceIndex < destinationIndex) {
        // Dragging down the list
        for (let i = destinationIndex - 1; i >= sourceIndex; i--) {
          periods[i].name = oldPeriods[i + 1].name;
        }
      } else {
        // Dragging up the list
        for (let i = destinationIndex + 1; i <= sourceIndex; i++) {
          periods[i].name = oldPeriods[i - 1].name;
        }
      }
      // Update the destination name that was actually dragged
      periods[destinationIndex].name = oldPeriods[sourceIndex].name;

      // Update placeholders
      updatePeriodPlaceholders(periods, t);
    } else if (draggableId.startsWith(draggablePrefixes.startOfAfternoonDrag)) {
      if (destinationIndex === 0) {
        // Can not allow, because there would be no space for an End Of Morning Period
        return null;
      }

      periods.forEach(p => {
        p.isHalfDayMorningEnd = false;
        p.isHalfDayAfternoonStart = false;
      });
      periods[destinationIndex].isHalfDayAfternoonStart = true;
      periods[destinationIndex - 1].isHalfDayMorningEnd = true;
    } else if (draggableId.startsWith(draggablePrefixes.endOfMorningDrag)) {
      const activePeriods = periods.filter(p => !p.skipped);
      if (destinationIndex === activePeriods.length - 1) {
        // Can not allow, because there would be no space for a Start Of Afternoon Period
        return null;
      }

      periods.forEach(p => {
        p.isHalfDayMorningEnd = false;
        p.isHalfDayAfternoonStart = false;
      });
      periods[destinationIndex].isHalfDayMorningEnd = true;
      periods[destinationIndex + 1].isHalfDayAfternoonStart = true;
    }

    return periods;
  };

  const removePeriod = (periods: Array<Period>, index: number) => {
    const periodItems = [...periods];
    const [removed] = periodItems.splice(index, 1);

    // Preserve a half day break
    if (removed.isHalfDayAfternoonStart || removed.isHalfDayMorningEnd) {
      let currentIndex = index;
      if (currentIndex === periodItems.length) {
        // Last period has been deleted
        currentIndex = currentIndex - 1;
      }
      const hasNextPeriod = periodItems[currentIndex + 1] != null;
      const hasPreviousPeriod = periodItems[currentIndex - 1] != null;
      if (removed.isHalfDayAfternoonStart) {
        const halfDayAfternoonStartIndex = hasPreviousPeriod
          ? currentIndex
          : currentIndex + 1;
        periodItems[halfDayAfternoonStartIndex].isHalfDayAfternoonStart = true;
        periodItems[halfDayAfternoonStartIndex].isHalfDayMorningEnd = false;
        periodItems[halfDayAfternoonStartIndex - 1].isHalfDayMorningEnd = true;
      } else if (removed.isHalfDayMorningEnd) {
        const halfDayMorningEndIndex = hasNextPeriod
          ? currentIndex
          : currentIndex - 1;
        periodItems[halfDayMorningEndIndex].isHalfDayMorningEnd = true;
        periodItems[halfDayMorningEndIndex].isHalfDayAfternoonStart = false;
        periodItems[halfDayMorningEndIndex + 1].isHalfDayAfternoonStart = true;
      }
    }

    updatePeriodPlaceholders(periodItems, t);
    return periodItems;
  };

  const skipPeriod = (periods: Array<Period>, index: number) => {
    const periodItems = [...periods];
    const skippedPeriod = periodItems[index];
    skippedPeriod.skipped = true;

    const sortedPeriods = periodItems.sort(
      (a, b) => (a.skipped ? 1 : 0) - (b.skipped ? 1 : 0)
    );

    // Preserve the half day break
    if (skippedPeriod.isHalfDayAfternoonStart) {
      skippedPeriod.isHalfDayAfternoonStart = false;
      const endOfMorningPeriodIndex = sortedPeriods.findIndex(
        p => p.isHalfDayMorningEnd
      );
      const activePeriods = sortedPeriods.filter(s => !s.skipped);
      if (endOfMorningPeriodIndex === activePeriods.length - 1) {
        sortedPeriods[endOfMorningPeriodIndex].isHalfDayAfternoonStart = true;
        sortedPeriods[endOfMorningPeriodIndex].isHalfDayMorningEnd = false;
        sortedPeriods[
          endOfMorningPeriodIndex - 1
        ].isHalfDayAfternoonStart = false;
        sortedPeriods[endOfMorningPeriodIndex - 1].isHalfDayMorningEnd = true;
      } else {
        sortedPeriods[
          endOfMorningPeriodIndex + 1
        ].isHalfDayAfternoonStart = true;
      }
    } else if (skippedPeriod.isHalfDayMorningEnd) {
      skippedPeriod.isHalfDayMorningEnd = false;
      const startOfAfternoonPeriodIndex = sortedPeriods.findIndex(
        p => p.isHalfDayAfternoonStart
      );
      if (startOfAfternoonPeriodIndex === 0) {
        sortedPeriods[0].isHalfDayMorningEnd = true;
        sortedPeriods[0].isHalfDayAfternoonStart = false;
        sortedPeriods[1].isHalfDayMorningEnd = false;
        sortedPeriods[1].isHalfDayAfternoonStart = true;
      } else {
        sortedPeriods[
          startOfAfternoonPeriodIndex - 1
        ].isHalfDayMorningEnd = true;
      }
    }

    return sortedPeriods;
  };

  const unskipPeriod = (periods: Array<Period>, index: number) => {
    const periodItems = [...periods];
    periodItems[index].skipped = false;
    return periodItems;
  };

  const addPeriod = (periods: Array<Period>, t: TFunction) => {
    const placeholder = `${t("Period")} ${periods.length + 1}`;
    const previousPeriod = periods[periods.length - 1];
    const defaultStartTime =
      previousPeriod && previousPeriod.endTime
        ? addMinutes(
            new Date(previousPeriod.endTime),
            travelDuration
          ).toISOString()
        : undefined;
    const periodItems = [
      ...periods,
      {
        placeholder,
        startTime: defaultStartTime,
        endTime: undefined,
        skipped: false,
      },
    ];

    updatePeriodPlaceholders(periodItems, t);
    return periodItems;
  };

  const updatePeriodPlaceholders = (periods: Array<Period>, t: TFunction) => {
    const halfDayBreakPeriod = periods.find(p => p.isHalfDayAfternoonStart);

    if (
      halfDayBreakPeriod &&
      periods.length === 3 &&
      periods[1].isHalfDayAfternoonStart
    ) {
      periods[0].placeholder = t("Morning");
      periods[2].placeholder = t("Afternoon");
    } else if (!halfDayBreakPeriod && periods.length === 2) {
      periods[0].placeholder = t("Morning");
      periods[1].placeholder = t("Afternoon");
    } else {
      let periodNumber = 1;
      periods.forEach(p => {
        if (!p.isHalfDayAfternoonStart) {
          p.placeholder = `${t("Period")} ${periodNumber++}`;
        }
      });
    }

    if (halfDayBreakPeriod) {
      halfDayBreakPeriod.placeholder = t("Lunch");
    }
  };

  const getError = (errors: any, fieldName: string, index: number) => {
    if (!errors.periods || !errors.periods[index]) {
      return null;
    }

    const periodError = errors.periods[index];
    if (!periodError) {
      return null;
    }

    if (!periodError[fieldName]) {
      return null;
    }

    const errorMessage: string = periodError[fieldName];
    return errorMessage;
  };

  const displayErrorIfPresent = (
    errors: any,
    fieldName: string,
    index: number
  ) => {
    const error = getError(errors, fieldName, index);
    if (!error) {
      return null;
    }

    return <FormHelperText error={true}>{error}</FormHelperText>;
  };

  const displayMinutesDuration = (
    startTime: string | undefined,
    endTime: string | undefined,
    showTravelDuration: boolean,
    t: TFunction
  ) => {
    if (!startTime || !endTime) {
      return null;
    }

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    if (!isValid(startTimeDate) || !isValid(endTimeDate)) {
      return null;
    }

    // As the TimeInput is changing, the value may not be a date string yet
    // and just a number (i.e. "10" for 10:00 am). Since we enforce "earliestTime" on
    // the TimeInput, endTime should never be before startTime so just bail out here
    // and wait till we have a valid date string
    if (endTimeDate < startTimeDate) {
      return null;
    }

    const minutes = differenceInMinutes(endTimeDate, startTimeDate);
    if (typeof minutes !== "number" || isNaN(minutes)) {
      return null;
    }

    const travelDurationString = ` (+${travelDuration}) `;
    const minutesDisplay = `${minutes}${
      showTravelDuration ? travelDurationString : " "
    }${t("minutes")}`;
    return minutesDisplay;
  };

  const renderPeriods = (
    periods: Array<Period>,
    setFieldValue: Function,
    errors: FormikErrors<{ periods: Period[] }>
  ) => {
    // Define the Draggable index (which must be unique within a Droppable and follow the order of the Draggables rendered)
    let draggableIndex = 1;

    const periodResult = periods.map((p, i) => {
      const periodClasses = [classes.period];
      if (i % 2 === 1) {
        periodClasses.push(classes.alternatingItem);
      }
      if (p.skipped) {
        periodClasses.push(classes.skippedPeriod);
      }

      // Determining valid start times for Periods
      const priorPeriodEndTime =
        i > 0 && periods[i - 1].endTime ? periods[i - 1].endTime : undefined;
      const earliestStartTime =
        priorPeriodEndTime && isValid(new Date(priorPeriodEndTime))
          ? addMinutes(
              new Date(priorPeriodEndTime),
              travelDuration
            ).toISOString()
          : undefined;

      return (
        <div key={i} className={periodClasses.join(" ")}>
          <div className={classes.actionDiv}>
            {periods.length > minNumberOfPeriods && (
              <div className={classes.action}>
                {!p.skipped &&
                  periods.filter(pf => !pf.skipped).length >
                    minNumberOfPeriods && (
                    <CancelOutlined
                      onClick={() => {
                        const updatedPeriods = props.isStandard
                          ? removePeriod(periods, i)
                          : skipPeriod(periods, i);
                        setFieldValue("periods", updatedPeriods);
                      }}
                    />
                  )}
                {p.skipped && (
                  <Add
                    onClick={() => {
                      const updatedPeriods = unskipPeriod(periods, i);
                      setFieldValue("periods", updatedPeriods);
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <Draggable
            key={`${draggablePrefixes.nameDrag}${i}`}
            draggableId={`${draggablePrefixes.nameDrag}${i}`}
            index={draggableIndex++}
            isDragDisabled={p.skipped}
          >
            {(provided, snapshot) => {
              const { innerRef } = provided;
              return (
                <div
                  ref={innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={classes.draggableSection}
                >
                  <div className={classes.nameInput}>
                    {props.isStandard && (
                      <FormTextField
                        placeholder={p.placeholder}
                        value={p.name || ""}
                        name={`periods[${i}].name`}
                        variant="outlined"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue(`periods[${i}].name`, e.target.value);
                        }}
                      />
                    )}
                    {!props.isStandard && p.name}
                  </div>
                  <div className={classes.actionDiv}>
                    {periods.length > 1 && !p.skipped && <DragHandle />}
                  </div>
                </div>
              );
            }}
          </Draggable>
          {p.skipped && (
            <div className={classes.skippedDiv}>{t("Skipped")}</div>
          )}
          {!p.skipped && (
            <>
              <Draggable
                key={`${draggablePrefixes.startOfAfternoonDrag}${i}`}
                draggableId={`${draggablePrefixes.startOfAfternoonDrag}${i}`}
                index={draggableIndex++}
              >
                {(provided, snapshot) => {
                  const { innerRef } = provided;
                  return (
                    <div
                      ref={innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={classes.startOfAfternoon}
                    >
                      <div
                        className={
                          !p.isHalfDayAfternoonStart ? classes.hidden : ""
                        }
                      >
                        <Chip
                          className={classes.startOfAfternoonChip}
                          label={t("Start of afternoon")}
                        />
                      </div>
                    </div>
                  );
                }}
              </Draggable>
              <div className={classes.timeInput}>
                <TimeInputComponent
                  label=""
                  value={p.startTime || undefined}
                  onValidTime={time => {
                    setFieldValue(`periods[${i}].startTime`, time);
                  }}
                  onChange={value => {
                    setFieldValue(`periods[${i}].startTime`, value);
                  }}
                  earliestTime={earliestStartTime}
                />
                {displayErrorIfPresent(errors, "startTime", i)}
              </div>
              <div className={classes.timeInput}>
                <TimeInputComponent
                  label=""
                  value={p.endTime || undefined}
                  onValidTime={time => {
                    setFieldValue(`periods[${i}].endTime`, time);
                    const nextPeriod = periods[i + 1];
                    if (nextPeriod && !nextPeriod.startTime) {
                      // Default the next Period's start time if not currently populated
                      setFieldValue(
                        `periods[${i + 1}].startTime`,
                        addMinutes(new Date(time), travelDuration).toISOString()
                      );
                    }
                  }}
                  onChange={value => {
                    setFieldValue(`periods[${i}].endTime`, value);
                  }}
                  earliestTime={p.startTime || earliestStartTime}
                />
                {displayErrorIfPresent(errors, "endTime", i)}
              </div>
              <Draggable
                key={`${draggablePrefixes.endOfMorningDrag}${i}`}
                draggableId={`${draggablePrefixes.endOfMorningDrag}${i}`}
                index={draggableIndex++}
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
                        className={!p.isHalfDayMorningEnd ? classes.hidden : ""}
                      >
                        <Chip
                          className={classes.endOfMorningChip}
                          label={t("End of morning")}
                        />
                      </div>
                    </div>
                  );
                }}
              </Draggable>
              <div className={classes.duration}>
                {displayMinutesDuration(
                  p.startTime,
                  p.endTime,
                  i < periods.length - 1,
                  t
                )}
              </div>
            </>
          )}
        </div>
      );
    });
    return periodResult;
  };

  return (
    <Section>
      {props.name && <SectionHeader title={props.name} />}
      <Formik
        initialValues={{
          periods: props.periods,
        }}
        enableReinitialize={true}
        onSubmit={(data, meta) => {
          props.onSubmit(data.periods, props.variantId);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={yup.object().shape({
          periods: yup.array().of(
            yup.object().shape({
              startTime: yup.string().when("skipped", {
                is: false,
                then: yup.string().required(t("Required")),
              }),
              endTime: yup.string().when("skipped", {
                is: false,
                then: yup.string().required(t("Required")),
              }),
            })
          ),
        })}
      >
        {({ handleSubmit, values, setFieldValue, submitForm, errors }) => (
          <form onSubmit={handleSubmit}>
            <DragDropContext
              onDragEnd={(result: DropResult) => {
                const updatedPeriods = onDragEnd(result, values.periods, t);
                if (updatedPeriods) {
                  setFieldValue("periods", updatedPeriods);
                }
              }}
            >
              <Droppable droppableId="droppable">
                {(provided, snapshot) => {
                  const { innerRef } = provided;
                  return (
                    <div ref={innerRef} {...provided.droppableProps}>
                      {renderPeriods(values.periods, setFieldValue, errors)}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </DragDropContext>
            <ActionButtons
              submit={{
                text: props.submitLabel || t("Save"),
                execute: submitForm,
              }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
              additionalActions={
                props.isStandard
                  ? [
                      {
                        text: t("Add Row"),
                        execute: () => {
                          const updatedPeriods = addPeriod(values.periods, t);
                          setFieldValue("periods", updatedPeriods);
                        },
                      },
                    ]
                  : []
              }
            />
          </form>
        )}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  period: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    height: theme.typography.pxToRem(75),
  },
  draggableSection: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  actionDiv: {
    width: theme.typography.pxToRem(50),
  },
  action: {
    cursor: "pointer",
    color: "initial",
  },
  nameInput: {
    width: theme.typography.pxToRem(200),
    margin: theme.spacing(),
  },
  timeInput: {
    width: theme.typography.pxToRem(100),
    margin: theme.spacing(),
  },
  hidden: {
    visibility: "hidden",
  },
  startOfAfternoon: {
    flexGrow: 2,
    textAlign: "right",
    paddingRight: theme.spacing(),
  },
  startOfAfternoonChip: {
    background: "#ECF9F3",
    color: "#00C853",
  },
  endOfMorningChip: {
    background: "#FCE7E7",
    color: "#E53935",
  },
  endOfMorning: {
    flexGrow: 2,
    textAlign: "left",
    paddingLeft: theme.spacing(),
  },
  duration: {
    width: theme.typography.pxToRem(125),
  },
  alternatingItem: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  skippedPeriod: {
    color: theme.customColors.gray,
  },
  skippedDiv: {
    flexGrow: 2,
    textTransform: "uppercase",
  },
}));
