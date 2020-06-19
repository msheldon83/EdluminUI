import * as React from "react";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles, Chip } from "@material-ui/core";
import { Period } from "../../helpers";
import { useDrag } from "react-dnd";

type AfternoonChipProps = {
  period: Period;
  hidden?: string;
  asPlaceholder?: boolean;
  draggableId?: symbol;
  label: string;
  chipStyle?: React.CSSProperties;
};

export const DraggableScheduleChip = (props: AfternoonChipProps) => {
  const classes = useStyles();
  const theme = useTheme();

  const {
    period,
    hidden = "",
    asPlaceholder = false,
    draggableId,
    label,
    chipStyle,
  } = props;

  const [_, dragRef] = useDrag({
    item: { type: draggableId ?? Symbol(Math.random()) },
  });

  const extraStyles = asPlaceholder
    ? {
        backgroundColor: theme.background.dropZone,
        color: theme.background.dropZone,
      }
    : {};

  const classNames = clsx({
    [classes.chipPlaceholder]: asPlaceholder,
  });

  return (
    <div className={`${classNames} ${hidden}`}>
      <Chip
        ref={draggableId ? dragRef : null}
        tabIndex={-1}
        className={classes.chip}
        label={label}
        style={{ ...chipStyle, ...extraStyles }}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  chip: {
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
