import * as React from "react";
import { getHours, parseISO } from "date-fns";

type Props = {
  dayPortion: number;
  startTime: string;
  className?: string;
};

export const DayIcon: React.FC<Props> = props => {
  if (props.dayPortion < 0.5) {
    return (
      <img
        src={require("ui/icons/partial-day.svg")}
        className={props.className}
      />
    );
  } else if (props.dayPortion === 0.5) {
    if (getHours(parseISO(props.startTime)) < 12) {
      return (
        <img
          src={require("ui/icons/half-day-am.svg")}
          className={props.className}
        />
      );
    } else {
      return (
        <img
          src={require("ui/icons/half-day-pm.svg")}
          className={props.className}
        />
      );
    }
  } else if (props.dayPortion > 0.5 && props.dayPortion < 2) {
    return (
      <img src={require("ui/icons/full-day.svg")} className={props.className} />
    );
  } else {
    return (
      <img
        src={require("ui/icons/multiple-fulldays.svg")}
        className={props.className}
      />
    );
  }
};
