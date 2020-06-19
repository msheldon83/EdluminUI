import * as React from "react";
import clsx from "clsx";
import { makeStyles, Chip } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { PermissionEnum } from "graphql/server-types.gen";
import { useCanDo } from "ui/components/auth/can";
import { useDrag, useDrop } from "react-dnd";
import { Period } from "../../helpers";
import { DraggableScheduleChip } from "./DraggableScheduleChip";

type Props = {
  periods: Period[];
  setPeriods: (periods: Period[]) => void;
  scheduleClasses: any;
};

const MorningDraggableType = Symbol("morning-chip-draggable");

type PeriodRowProps = {
  period: Period;
  hidden: any;
  periodClassName: string;
  onDrop: () => void;
  isBeforeAfternoonStart: boolean;
};
const PeriodRow = (props: PeriodRowProps) => {
  const {
    period,
    hidden,
    periodClassName,
    onDrop,
    isBeforeAfternoonStart,
  } = props;

  const { t } = useTranslation();

  const canDoFn = useCanDo();
  const canScheduleSettingsSave = canDoFn([
    PermissionEnum.ScheduleSettingsSave,
  ]);
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: MorningDraggableType,
    drop: () => {
      onDrop();
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && isBeforeAfternoonStart,
    }),
  });

  const renderChip = () => {
    if (isOver && canDrop) {
      return (
        <DraggableScheduleChip
          label={t("End of morning")}
          period={period}
          asPlaceholder
        />
      );
    }

    if (!period.skipped) {
      return (
        <>
          <DraggableScheduleChip
            period={period}
            hidden={!period.isHalfDayMorningEnd ? hidden : ""}
            label={t("End of morning")}
            draggableId={
              canScheduleSettingsSave ? MorningDraggableType : undefined
            }
            chipStyle={{
              background: "#FCE7E7",
              color: "#E53935",
            }}
          />
        </>
      );
    }

    return undefined;
  };

  return (
    <div className={periodClassName} ref={dropRef}>
      {renderChip()}
    </div>
  );
};

export const ScheduleMorningColumn: React.FC<Props> = props => {
  const startOfAfternoonIndex = props.periods.findIndex(
    p => p.isHalfDayAfternoonStart
  );

  return (
    <div>
      {props.periods.map((p, i) => {
        const periodClasses = clsx({
          [props.scheduleClasses.period]: true,
          [props.scheduleClasses.alternatingItem]: i % 2 === 1,
          [props.scheduleClasses.skippedPeriod]: p.skipped,
        });

        return (
          <PeriodRow
            period={p}
            hidden={props.scheduleClasses.hidden}
            periodClassName={periodClasses}
            isBeforeAfternoonStart={i <= startOfAfternoonIndex}
            key={p.periodId ?? i}
            onDrop={() => {
              console.log("dropped");
              const updatedPeriods = handleDrop(props.periods, i);
              props.setPeriods(updatedPeriods);
            }}
          />
        );
      })}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  endOfMorning: {
    textAlign: "left",
  },
  endOfMorningChip: {
    background: "#FCE7E7",
    color: "#E53935",
    cursor: "grab",
    transform: "translate(0, 0)",

    "&:active": {
      cursor: "grabbing",
    },
  },
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 0.8 },
  },
  chipPlaceholder: {
    animation: "$fadeIn 120ms",
  },
}));

const handleDrop = (periods: Period[], dropIndex: number) => {
  if (periods[dropIndex].skipped) {
    // Should not be able to assign anything to a Skipped period
    return periods;
  }

  // Find index of start of afternoon. End of morning cannot be after start of afternoon, but they can be the same.
  const startOfAfternoonIndex = periods.findIndex(
    p => p.isHalfDayAfternoonStart
  );

  if (dropIndex > startOfAfternoonIndex) {
    return periods;
  }

  return periods.map((period, index) => {
    return {
      ...period,
      isHalfDayMorningEnd: index === dropIndex,
    };
  });
};
