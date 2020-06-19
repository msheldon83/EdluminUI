import * as React from "react";
import clsx from "clsx";
import { Period } from "../../helpers";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { PermissionEnum } from "graphql/server-types.gen";
import { useCanDo } from "ui/components/auth/can";
import { useDrop } from "react-dnd";
import { DraggableScheduleChip } from "./DraggableScheduleChip";

type Props = {
  periods: Period[];
  setPeriods: (periods: Period[]) => void;
  scheduleClasses: any;
};

const AfternoonDraggableType = Symbol("afternoon-chip-draggable");

type PeriodRowProps = {
  period: Period;
  hidden: any;
  periodClassName: string;
  onDrop: () => void;
  isAfterMorningEnd: boolean;
  canScheduleSettingsSave: boolean;
};
const PeriodRow = (props: PeriodRowProps) => {
  const {
    period,
    hidden,
    periodClassName,
    onDrop,
    isAfterMorningEnd,
    canScheduleSettingsSave,
  } = props;

  const { t } = useTranslation();
  const classes = useStyles();

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: AfternoonDraggableType,
    drop: () => {
      onDrop();
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && isAfterMorningEnd,
    }),
  });

  const label = t("Start of afternoon");

  const renderChip = () => {
    if (isOver && canDrop) {
      return (
        <DraggableScheduleChip label={label} period={period} asPlaceholder />
      );
    }

    if (!period.skipped) {
      return (
        <>
          <div className={classes.startOfAfternoon}>
            <DraggableScheduleChip
              period={period}
              hidden={!period.isHalfDayAfternoonStart ? hidden : ""}
              label={label}
              draggableId={
                canScheduleSettingsSave ? AfternoonDraggableType : undefined
              }
              chipStyle={{
                background: "#ECF9F3",
                color: "#00C853",
              }}
            />
          </div>
        </>
      );
    }

    return undefined;
  };

  return (
    <div className={`${periodClassName} ${classes.chipWrapper}`} ref={dropRef}>
      {renderChip()}
    </div>
  );
};

export const ScheduleAfternoonColumn: React.FC<Props> = props => {
  const canDoFn = useCanDo();
  const canScheduleSettingsSave = canDoFn([
    PermissionEnum.ScheduleSettingsSave,
  ]);

  const endOfMorningIndex = props.periods.findIndex(p => p.isHalfDayMorningEnd);

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
            isAfterMorningEnd={i >= endOfMorningIndex}
            canScheduleSettingsSave={canScheduleSettingsSave}
            key={period.periodId ?? i}
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

const useStyles = makeStyles(theme => ({
  startOfAfternoon: {
    textAlign: "right",
    width: "auto",
    display: "block",
  },
  chipWrapper: {
    /*
      This overrides some parent style that is impossible to override without the !important

      The style can be found here:

      https://github.com/RedRoverK12/EdluminUI/blob/d177675a74415338dcda20f7f166fb9e575730f1/modules/ui/pages/bell-schedule/components/schedule.tsx#L340
    */
    justifyContent: "flex-end !important",
  },
}));

const handleDrop = (periods: Period[], dropIndex: number) => {
  if (periods[dropIndex].skipped) {
    // Should not be able to assign anything to a Skipped period
    return periods;
  }

  // Find index of End Of Morning. Start of Afternoon cannot be before End of Morning, but they can be the same.
  const endOfMorningIndex = periods.findIndex(p => p.isHalfDayMorningEnd);

  if (dropIndex < endOfMorningIndex) {
    return periods;
  }

  return periods.map((period, index) => {
    return {
      ...period,
      isHalfDayAfternoonStart: index === dropIndex,
    };
  });
};
