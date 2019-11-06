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

export const Schedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    // TODO: For Drag and Drop functionality
    // const periodItems = Array.from(periods);
    // const [removed] = periodItems.splice(result.source.index, 1);
    // periodItems.splice(result.destination.index, 0, removed);
    // setPeriods(periodItems);
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

    const startTimeDate = +new Date(startTime);
    const endTimeDate = +new Date(endTime);
    const minutes = startTimeDate == endTimeDate ? 0 : Math.round((endTimeDate - startTimeDate) / 1000 / 60);
    if (typeof minutes !== "number" || isNaN(minutes)) {
      return null;
    }

    const minutesDisplay = `${minutes}${showTravelDuration ? " (+5)": ""} ${t("minutes")}`;
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
          {/* <Draggable key={i} draggableId={i.toString()} index={i}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <span className={classes.action}>
                  <DragHandle />
                </span>
              </div>
            )}
          </Draggable> */}
          {/* FormTextField should move into Draggable when implementing drag and drop */}
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
          <div className={classes.startOfAfternoon}>
            <Chip className={!p.isHalfDayAfternoonStart ? classes.hidden : classes.startOfAfternoonChip} label={t("Start of afternoon")} />
          </div>
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
            <DragDropContext onDragEnd={onDragEnd}>
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
