import * as React from "react";
import { useTranslation } from "react-i18next";
import { Period } from "../../helpers";
import { makeStyles, IconButton } from "@material-ui/core";
import { DragHandle } from "@material-ui/icons";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";
import { useDrag, useDrop } from "hooks/drag-drop";
import { UpdatePeriodPlaceholders } from "../../helpers";

type Props = {
  periods: Period[];
  isStandard: boolean;
  setPeriods: (periods: Period[]) => void;
  setFieldValue: Function;
  scheduleClasses: any;
};

const nameDraggableId = Symbol("name-draggable");

type ScheduleNameRowProps = {
  period: Period;
  hasMoreThanOnePeriod: boolean;
  isStandard: boolean;
  setFieldValue: Function;
  tabIndex: number;
  index: number;
  swapRowName(from: number, to: number): void;
  findRow(period: Period): number;
};

const ScheduleNameRow = (props: ScheduleNameRowProps) => {
  const {
    period,
    index,
    isStandard,
    hasMoreThanOnePeriod,
    setFieldValue,
    tabIndex,
    swapRowName,
    findRow,
  } = props;

  const classes = useStyles();

  const { dragHandleRef, dragPreviewRef, dragPreviewOpacity } = useDrag({
    dragId: nameDraggableId,
    data: {
      period,
    },
    generateDragValues({ isDragging }) {
      return {
        dragPreviewOpacity: isDragging() ? 0.2 : 1,
      };
    },
  });

  const { dropRef } = useDrop({
    dragId: nameDraggableId,
    generateDropValues() {},
    canDrop(data) {
      return !data.period.skipped;
    },
    onHover(data) {
      const toIndex = findRow(period);
      const fromIndex = findRow(data.period);

      swapRowName(fromIndex, toIndex);
    },
  });

  return (
    <div
      className={classes.draggableSection}
      ref={node => dropRef(dragPreviewRef(node))}
    >
      <div className={classes.nameInput}>
        {isStandard ? (
          <FormTextField
            inputProps={{
              tabIndex,
            }}
            placeholder={period.placeholder}
            value={period.name}
            name={
              // There always needs to be a valid name on the element
              period.name && period.name.length > 0
                ? period.name
                : Math.random().toString()
            }
            variant="outlined"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFieldValue(`periods[${index}].name`, e.target.value);
            }}
            style={{ opacity: dragPreviewOpacity }}
          />
        ) : (
          period.name
        )}
      </div>
      <IconButton
        className={classes.draggHandle}
        tabIndex={-1}
        focusRipple={false}
        disableRipple
        ref={dragHandleRef}
      >
        {hasMoreThanOnePeriod && !period.skipped && <DragHandle />}
      </IconButton>
    </div>
  );
};

export const ScheduleNamesColumn: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div>
      {props.periods.map((p, i) => {
        const periodClasses = [props.scheduleClasses.period];
        if (i % 2 === 1) {
          periodClasses.push(props.scheduleClasses.alternatingItem);
        }
        if (p.skipped) {
          periodClasses.push(props.scheduleClasses.skippedPeriod);
        }

        const rowKey = p.periodId ?? p.placeholder ?? Math.random().toString();

        return (
          <div key={rowKey} className={periodClasses.join(" ")}>
            <Can do={[PermissionEnum.ScheduleSettingsSave]}>
              <ScheduleNameRow
                period={p}
                hasMoreThanOnePeriod={props.periods.length > 1}
                isStandard={props.isStandard}
                setFieldValue={props.setFieldValue}
                tabIndex={i + 1}
                index={i}
                swapRowName={(from, to) => {
                  if (props.periods[to].skipped) {
                    return;
                  }

                  UpdatePeriodPlaceholders(props.periods, t);

                  if (from !== to) {
                    const fromPeriod = props.periods[from];
                    const toPeriod = props.periods[to];

                    // Need to swap multiple properties to make references to the rows correct
                    props.periods[from] = {
                      ...props.periods[from],
                      periodId: toPeriod.periodId,
                      placeholder: toPeriod.placeholder,
                      name: toPeriod.name,
                    };
                    props.periods[to] = {
                      ...props.periods[to],
                      periodId: fromPeriod.periodId,
                      placeholder: fromPeriod.placeholder,
                      name: fromPeriod.name,
                    };

                    props.setPeriods(props.periods);
                  }
                }}
                findRow={period => {
                  return props.periods.findIndex(
                    p => p.periodId === period.periodId
                  );
                }}
              />
            </Can>
            <Can not do={[PermissionEnum.ScheduleSettingsSave]}>
              <div className={classes.nameDisplay}>{p.name}</div>
            </Can>
          </div>
        );
      })}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  nameInput: {
    width: theme.typography.pxToRem(200),
    margin: theme.spacing(),

    "& input": {
      backgroundColor: theme.customColors.white,
    },
  },
  nameDisplay: {
    marginLeft: theme.spacing(2),
  },
  draggableSection: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    transform: "translate(0, 0)",
  },
  draggHandle: {
    cursor: "grab",
    width: theme.typography.pxToRem(50),

    "&:active": {
      cursor: "grabbing",
    },
  },
}));
