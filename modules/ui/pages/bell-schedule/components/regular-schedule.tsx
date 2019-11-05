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
  periods: Array<Period>;
  onSubmit: (periods: Array<Period>) => void;
  onCancel: () => void;
};

export type Period = {
  name?: string;
  placeholder: string;
  startTime?: string;
  endTime?: string;
  isHalfDayMorningEnd?: boolean;
  isHalfDayAfternoonStart?: boolean;
};

export const RegularSchedule: React.FC<Props> = props => {
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
    const [removed] = periodItems.splice(index, 1);

    // Handle the renames of period placeholders
    // Handle the moving of what is endOfMorning and startOfAfternoon

    return periodItems;
  };

  const addPeriod = (periods: Array<Period>, t: TFunction) => {
    const placeholder = `${t("Period")} ${periods.length + 1}`;
    const periodItems = [
      ...periods,
      { placeholder, startTime: undefined, endTime: undefined },
    ];

    // Handle renames of period placeholders if we've just introduced more than Morning / Afternoon

    return periodItems;
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
  }

  const displayErrorIfPresent = (errors: any, fieldName: string, index: number) => {
    const error = getError(errors, fieldName, index);
    if (!error) {
      return null;
    }

    return <FormHelperText error={true}>{error}</FormHelperText>
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
            <Chip className={!p.isHalfDayAfternoonStart ? classes.hidden : ""} label={t("Start of afternoon")} />
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
            <Chip className={!p.isHalfDayMorningEnd ? classes.hidden : ""} label={t("End of morning")} />
          </div>
          <div>
            {/* Add the time duration as a string */}
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
          props.onSubmit(data.periods);
        }}
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
                  return (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
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
  endOfMorning: {
    flexGrow: 2,
    textAlign: "left",
    paddingLeft: theme.spacing()
  },
  alternatingItem: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  }
}));
