import * as React from "react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import {
  makeStyles,
  FormControlLabel,
  Checkbox,
  Chip,
  FormHelperText,
} from "@material-ui/core";
import * as yup from "yup";
import { Formik, FormikHelpers, FormikErrors } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { TimeInput as TimeInputComponent } from "ui/components/form/time-input";
import { ActionButtons } from "../../../components/action-buttons";
import { CancelOutlined, DragHandle } from "@material-ui/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { TFunction } from "i18next";
import { addMinutes, differenceInMinutes, isValid } from "date-fns";

type Props = {
  isStandard: boolean;
  periods: Array<Period>;
  variantId?: number | null | undefined;
  onSubmit: (periods: Array<Period>, variantId?: number | null | undefined) => void;
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
};

const travelDuration = 5;

export const Schedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  const onDragEnd = (result: DropResult, periods: Array<Period>, t: TFunction): Array<Period> => {
    const {destination, source} = result;
    
    if (!destination) {
      return periods;
    }
    if (destination.droppableId === source.droppableId 
      && destination.index === source.index) {
      return periods;
    }

    // Just reordering the names of the periods
    const oldPeriods = periods.map(p => { return {...p}});
    if (source.index < destination.index) {
      // Dragging down the list
      for (let i = destination.index-1; i >= source.index; i--) {
        console.log("DRAG DOWN", i, periods[i].name, oldPeriods[i+1].name);
        periods[i].name = oldPeriods[i+1].name;
      }
    } else {
      // Dragging up the list
      for (let i = destination.index+1; i <= source.index; i++) {
        console.log("DRAG UP", i, periods[i].name, oldPeriods[i-1].name);
        periods[i].name = oldPeriods[i-1].name;
      }
    }
    // Update the destination name that was actually dragged
    periods[destination.index].name = oldPeriods[source.index].name;

    // Update placeholders
    updatePeriodPlaceholders(periods, t);

    return periods;
  };

  const removePeriod = (periods: Array<Period>, index: number) => {
    const periodItems = Array.from(periods);
    periodItems.splice(index, 1);
    updatePeriodPlaceholders(periodItems, t);
    return periodItems;
  };

  const addPeriod = (periods: Array<Period>, t: TFunction) => {
    const placeholder = `${t("Period")} ${periods.length + 1}`;
    const periodItems = [
      ...periods,
      { placeholder, startTime: undefined, endTime: undefined },
    ];

    updatePeriodPlaceholders(periodItems, t);
    return periodItems;
  };

  const updatePeriodPlaceholders = (periods: Array<Period>, t: TFunction) => {
    const halfDayBreakPeriod = periods.find(p => p.isHalfDayAfternoonStart);

    if (halfDayBreakPeriod && periods.length === 3 && periods[1].isHalfDayAfternoonStart) {
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
      })
    }

    if (halfDayBreakPeriod) {
      halfDayBreakPeriod.placeholder = t("Lunch");
    }
  } 

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
  }

  const displayErrorIfPresent = (errors: any, fieldName: string, index: number) => {
    const error = getError(errors, fieldName, index);
    if (!error) {
      return null;
    }

    return <FormHelperText error={true}>{error}</FormHelperText>
  }

  const displayMinutesDuration = (startTime: string | undefined, endTime: string | undefined, 
    showTravelDuration: boolean, t: TFunction) => {
    if (!startTime || !endTime) {
      return null;
    }

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    if (!isValid(startTimeDate) || !isValid(endTimeDate)) {
      return null;
    }

    const minutes = differenceInMinutes(endTimeDate, startTimeDate);
    if (typeof minutes !== "number" || isNaN(minutes)) {
      return null;
    }

    const travelDurationString = ` (+${travelDuration}) `;
    const minutesDisplay = `${minutes}${showTravelDuration ? travelDurationString: " "}${t("minutes")}`;
    return minutesDisplay;
  }

  const renderPeriods = (
    periods: Array<Period>,
    setFieldValue: Function,
    errors: FormikErrors<{ periods: Period[] }>
  ) => {
    const periodResult = periods.map((p, i) => {
      const periodClasses = [classes.period];
      if (i % 2 === 1) {
        periodClasses.push(classes.alternatingItem);
      }

      const priorPeriodEndTime = i > 0 && periods[i-1].endTime ? periods[i-1].endTime : undefined;
      const earliestStartTime = priorPeriodEndTime && isValid(new Date(priorPeriodEndTime))
        ? addMinutes(new Date(priorPeriodEndTime), travelDuration).toISOString()
        : undefined;
      
      return (
        <div key={i} className={periodClasses.join(" ")}>
          <div className={classes.action}>
            {periods.length > 1 && (
              <CancelOutlined onClick={() => { 
                const updatedPeriods = removePeriod(periods, i);
                setFieldValue('periods', updatedPeriods);
              }} />
            )}
          </div>
          <Draggable key={i} draggableId={i.toString()} index={i}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={classes.draggableSection}
              >
                <div>
                  <FormTextField
                    placeholder={p.placeholder}
                    value={p.name || ""}
                    name={`periods[${i}].name`}
                    className={classes.nameInput}
                    variant="outlined"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFieldValue(`periods[${i}].name`, e.target.value);
                    }}
                  />
                </div>
                <div className={classes.dragHandle}>
                  {props.isStandard && <DragHandle />}
                </div>
              </div>
            )}
          </Draggable>
          <div className={classes.startOfAfternoon}>
            <Chip className={!p.isHalfDayAfternoonStart ? classes.hidden : classes.startOfAfternoonChip} label={t("Start of afternoon")} />
          </div>
          <div className={classes.timeInput}>
            <TimeInputComponent
              label=""
              value={p.startTime || earliestStartTime}
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
              }}
              onChange={value => {
                setFieldValue(`periods[${i}].endTime`, value);
              }}
              earliestTime={p.startTime}
            />
            {displayErrorIfPresent(errors, "endTime", i)}
          </div>
          <div className={classes.endOfMorning}>
            <Chip className={!p.isHalfDayMorningEnd ? classes.hidden : classes.endOfMorningChip} label={t("End of morning")} />
          </div>
          <div className={classes.duration}>
            {displayMinutesDuration(p.startTime, p.endTime, i < periods.length-1, t)}
          </div>
        </div>
      );
    });
    return periodResult;
  };

  return (
    <Section>
      <SectionHeader title={t("Regular")} />
      <Formik
        initialValues={{
          periods: props.periods,
        }}
        enableReinitialize={true}
        onSubmit={(data, meta) => {
          console.log(data);
          props.onSubmit(data.periods, props.variantId);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={yup.object().shape({
          periods: yup.array()
            .of(
              yup.object().shape({
                startTime: yup.string().required(t("Required")),
                endTime: yup.string().required(t("Required")),
              })
            )
        })}
      >
        {({
          handleSubmit,
          values,
          setFieldValue,
          submitForm,
          errors
        }) => (
          <form onSubmit={handleSubmit}>
            <DragDropContext onDragEnd={(result: DropResult) => {
              const updatedPeriods = onDragEnd(result, values.periods, t);
              setFieldValue('periods', updatedPeriods);
            }}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => {
                  const { innerRef } = provided;
                  return (
                    <div ref={innerRef} {...provided.droppableProps}>
                      {renderPeriods(
                        values.periods,
                        setFieldValue,
                        errors
                      )}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </DragDropContext>
            <ActionButtons
              submit={{ text: t("Save"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
              additionalActions={[
                { text: t("Add Row"), 
                  execute: () => { 
                    const updatedPeriods = addPeriod(values.periods, t);
                    setFieldValue('periods', updatedPeriods);
                  }
                },
              ]}
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
    alignItems: "center"
  },
  draggableSection: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  dragHandle: {
    width: theme.typography.pxToRem(50),
  },
  action: {
    width: theme.typography.pxToRem(50),
    cursor: "pointer",
  },
  nameInput: {
    width: theme.typography.pxToRem(200),
    margin: theme.spacing()
  },
  timeInput: {
    width: theme.typography.pxToRem(100),
    margin: theme.spacing()
  },
  hidden: {
    visibility: "hidden"
  },
  startOfAfternoon: {
    flexGrow: 2,
    textAlign: "right",
    paddingRight: theme.spacing()
  },
  startOfAfternoonChip: {
    background: "#ECF9F3",
    color: "#00C853"
  },
  endOfMorningChip: {
    background: "#FCE7E7",
    color: "#E53935"
  },
  endOfMorning: {
    flexGrow: 2,
    textAlign: "left",
    paddingLeft: theme.spacing()
  },
  duration: {
    width: theme.typography.pxToRem(125)
  },
  alternatingItem: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  }
}));
