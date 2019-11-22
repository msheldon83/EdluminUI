import * as React from "react";

type Props = {
  dayPortion: number;
};

export const DayIcon: React.FC<Props> = props => {
  if (props.dayPortion < 0.5) {
    return <img src={require("ui/icons/partial-day.svg")} />;
  } else if (props.dayPortion === 0.5) {
    return <img src={require("ui/icons/half-day.svg")} />;
  } else if (props.dayPortion > 0.5 && props.dayPortion < 2) {
    return <img src={require("ui/icons/full-day.svg")} />;
  } else {
    return <img src={require("ui/icons/multiple-fulldays.svg")} />;
  }
};
