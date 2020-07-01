import * as React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { PermissionEnum } from "graphql/server-types.gen";
import { useCanDo } from "ui/components/auth/can";
import { useDrop, DropValidationData } from "hooks/drag-drop";
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
  canScheduleSettingsSave: boolean;
};
const PeriodRow = (props: PeriodRowProps) => {
  const {
    period,
    hidden,
    periodClassName,
    onDrop,
    isBeforeAfternoonStart,
    canScheduleSettingsSave,
  } = props;

  const { t } = useTranslation();

  const { isOver, canDrop, dropRef } = useDrop({
    dragId: MorningDraggableType,
    onDrop() {
      onDrop();
    },
    generateDropValues: ({ isOver, canDrop }: DropValidationData) => ({
      isOver: isOver(),
      canDrop: canDrop() && isBeforeAfternoonStart && !period.skipped,
    }),
  });

  const label = t("End of morning");

  const renderChip = () => {
    if (isOver && canDrop) {
      return (
        <DraggableScheduleChip label={label} period={period} asPlaceholder />
      );
    }

    if (!period.skipped) {
      return (
        <>
          <DraggableScheduleChip
            period={period}
            hidden={!period.isHalfDayMorningEnd ? hidden : ""}
            label={label}
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
  const canDoFn = useCanDo();
  const canScheduleSettingsSave = canDoFn([
    PermissionEnum.ScheduleSettingsSave,
  ]);

  const startOfAfternoonIndex = props.periods.findIndex(
    p => p.isHalfDayAfternoonStart
  );

  return (
    <div>
      {props.periods.map((period, i) => {
        const periodClasses = clsx({
          [props.scheduleClasses.period]: true,
          [props.scheduleClasses.alternatingItem]: i % 2 === 1,
          [props.scheduleClasses.skippedPeriod]: period.skipped,
        });

        return (
          <PeriodRow
            period={period}
            hidden={props.scheduleClasses.hidden}
            periodClassName={periodClasses}
            isBeforeAfternoonStart={i <= startOfAfternoonIndex}
            key={period.periodId ?? i}
            canScheduleSettingsSave={canScheduleSettingsSave}
            onDrop={() => {
              const updatedPeriods = handleDrop(props.periods, i);
              props.setPeriods(updatedPeriods);
            }}
          />
        );
      })}
    </div>
  );
};

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
