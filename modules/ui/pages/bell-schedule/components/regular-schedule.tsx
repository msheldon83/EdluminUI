import * as React from "react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import {
  makeStyles,
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormHelperText,
} from "@material-ui/core";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { ActionButtons } from "../../../components/action-buttons";
import { Period } from "../add";
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
  hasHalfDayBreak: boolean;
  onSubmit: (periods: Array<Period>) => void;
  onCancel: () => void;
};

const buildPeriods = (
  periods: Array<Period>,
  hasHalfDayBreak: boolean,
  t: TFunction
) => {
  let periodItems = Array.from(periods);
  const alreadyHasHalfDayBreakPeriod =
    periodItems.find(p => p.isHalfDayBreakPeriod) != null;

  // Add Half Day Break if enabled and not already present
  if (hasHalfDayBreak && !alreadyHasHalfDayBreakPeriod) {
    const halfDayBreakIndex = Math.ceil(periodItems.length / 2);
    periodItems.splice(halfDayBreakIndex, 0, {
      placeholder: t("Lunch"),
      startTime: "",
      endTime: "",
      isHalfDayBreakPeriod: true,
    });
  }

  // Remove Half Day Break if disabled, but currently present in the list
  if (!hasHalfDayBreak && alreadyHasHalfDayBreakPeriod) {
    periodItems = periodItems.filter(p => !p.isHalfDayBreakPeriod);
  }

  // Handle placeholder content
  if (hasHalfDayBreak && periodItems.length === 3) {
    periodItems[0].placeholder = t("Morning");
    periodItems[2].placeholder = t("Afternoon");
  } else if (!hasHalfDayBreak && periodItems.length === 2) {
    periodItems[0].placeholder = t("Morning");
    periodItems[1].placeholder = t("Afternoon");
  } else {
    periodItems.forEach((p, i) => {
      p.placeholder = p.isHalfDayBreakPeriod
        ? t("Lunch")
        : `${t("Period")} ${i + 1}`;
    });
  }

  console.log(periodItems);
  return periodItems;
};

export const RegularSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [periods, setPeriods] = React.useState<Array<Period>>(
    buildPeriods(props.periods, props.hasHalfDayBreak, t)
  );
  const [hasHalfDayBreak, setHasHalfDayBreak] = React.useState<boolean>(
    props.hasHalfDayBreak
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const periodItems = Array.from(periods);
    const [removed] = periodItems.splice(result.source.index, 1);
    periodItems.splice(result.destination.index, 0, removed);

    setPeriods(periodItems);
  };

  const removePeriod = (index: number) => {
    const periodItems = Array.from(periods);
    const [removed] = periodItems.splice(index, 1);
    setPeriods(buildPeriods(periodItems, hasHalfDayBreak, t));
  };

  const addPeriod = (t: TFunction) => {
    const placeholder = `${t("Period")} ${periods.length + 1}`;
    const periodItems = [
      ...periods,
      { placeholder, startTime: "", endTime: "" },
    ];
    setPeriods(buildPeriods(periodItems, hasHalfDayBreak, t));
  };

  const renderPeriods = (
    periods: Array<Period>,
    hasHalfDayBreak: boolean,
    setFieldValue: Function
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
              <CancelOutlined onClick={() => removePeriod(i)} />
            )}
          </div>
          <Draggable key={i} draggableId={i.toString()} index={i}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
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
                <span className={classes.action}>
                  <DragHandle />
                </span>
              </div>
            )}
          </Draggable>
          <div>
            <FormTextField
              name={`periods[${i}].startTime`}
              value={p.startTime || ""}
              variant="outlined"
              className={classes.timeInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue(`periods[${i}].startTime`, e.target.value);
              }}
            />
          </div>
          <div>
            <FormTextField
              name={`periods[${i}].endTime`}
              value={p.endTime || ""}
              variant="outlined"
              className={classes.timeInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue(`periods[${i}].endTime`, e.target.value);
              }}
            />
          </div>
          <div>Extra time info - {i}</div>
        </div>
      );
    });
    return periodResult;
  };

  return (
    <Section>
      <SectionHeader title={t("Regular")} />
      <FormControlLabel
        control={
          <Checkbox
            checked={hasHalfDayBreak}
            onChange={e => {
              setHasHalfDayBreak(e.target.checked);
              setPeriods(buildPeriods(periods, e.target.checked, t));
            }}
            value={hasHalfDayBreak}
            color="primary"
          />
        }
        label={t("Has a half day break")}
      />
      <Formik
        initialValues={{
          periods,
        }}
        onSubmit={(data, meta) => {
          props.onSubmit(data.periods);
        }}
        validationSchema={yup.object().shape({
          // name: yup
          //   .string()
          //   .nullable()
          //   .required(t("Name is required")),
          // externalId: yup.string().nullable(),
          //TODO: Handle validation of array of objects
        })}
      >
        {({
          handleSubmit,
          handleChange,
          values,
          setFieldValue,
          submitForm,
        }) => (
          <form onSubmit={handleSubmit}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => {
                  return (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {renderPeriods(
                        values.periods,
                        hasHalfDayBreak,
                        setFieldValue
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
                { text: t("Add Row"), execute: () => addPeriod(t) },
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
  },
  action: {
    width: theme.typography.pxToRem(50),
    cursor: "pointer",
  },
  nameInput: {
    width: theme.typography.pxToRem(200),
  },
  timeInput: {
    width: theme.typography.pxToRem(100),
  },
  alternatingItem: {
    background: "#F5F5F5",
    borderTop: "1px solid #E5E5E5",
    borderBottom: "1px solid #E5E5E5",
  },
}));
