import * as React from "react";
import getHours from "date-fns/getHours";
import parseISO from "date-fns/parseISO";

type Props = {
  dayPortion: number;
  startTime: string;
};

export const DayIcon: React.FC<Props> = props => {
  if (props.dayPortion < 0.5) {
    return <img src={require("ui/icons/partial-day.svg")} />;
  } else if (props.dayPortion === 0.5) {
    if (getHours(parseISO(props.startTime)) < 12) {
      return <img src={require("ui/icons/half-day-am.svg")} />;
    } else {
      return <img src={require("ui/icons/half-day-pm.svg")} />;
    }
  } else if (props.dayPortion > 0.5 && props.dayPortion < 2) {
    return <img src={require("ui/icons/full-day.svg")} />;
  } else {
    return <img src={require("ui/icons/multiple-fulldays.svg")} />;
  }
};
