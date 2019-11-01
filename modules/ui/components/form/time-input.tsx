import * as React from "react";
import { initial } from "lodash-es";
import TextField from "@material-ui/core/TextField";
import { Select, OptionType } from "./select";
import {
  humanizeTimeStamp,
  midnightTime,
  parseTimeFromString,
} from "../../../helpers/time";

type Props = {
  label: string;
  value?: number;
  onChange: (value: string) => void;
  timeInterval?: number; // in minutes
  startTime?: Date;
  onValidTime: (value: string) => void;
};

const DEFAULT_TIME_INTERVAL = 30;
const NUMBER_OF_MILLISECONDS_IN_DAY = 86400 * 1000;

const addTime = (time: number, timeIntervalInMinutes: number) => {
  const seconds = timeIntervalInMinutes * 60 * 1000;
  return time + seconds;
};

const generateTimesByInterval = (
  startTime: number,
  timeInterval: number = DEFAULT_TIME_INTERVAL
): number[] => {
  const times = [startTime];
  let currentEndTime = startTime;

  while (currentEndTime - startTime < NUMBER_OF_MILLISECONDS_IN_DAY) {
    currentEndTime = addTime(currentEndTime, timeInterval);
    times.push(currentEndTime);
  }

  // The last time is a duplicate so this removes it
  return initial(times);
};

export const TimeInput = (props: Props) => {
  const startTime = props.startTime
    ? props.startTime.getTime()
    : midnightTime();
  const times = generateTimesByInterval(startTime, props.timeInterval);

  const options = times.map(time => {
    return {
      label: humanizeTimeStamp(time),
      value: time,
    };
  });

  const filterOption = ({ value = 0 }: OptionType, input: string) => {
    if (input === "") {
      return true;
    }

    const time = parseTimeFromString(input);

    const inputDate = new Date(time);
    const dropdownDate = new Date(value);

    const inputHours = String(inputDate.getHours());
    const dropdownHours = String(dropdownDate.getHours());

    // Comparing midnight and noon
    if (inputHours === "12" || inputHours == "0") {
      return dropdownHours === "12" || dropdownHours === "0";
    }

    return dropdownHours === inputHours;
  };

  const getValue = (rawValue?: number) => {
    if (!rawValue) {
      return;
    }

    const rawDate = new Date(rawValue);

    const rawHours = rawDate.getHours();
    const rawMinutes = rawDate.getMinutes();

    return options.find(({ value }) => {
      const date = new Date(value);
      return date.getHours() === rawHours && date.getMinutes() === rawMinutes;
    });
  };

  return (
    <TextField
      label={props.label}
      variant="outlined"
      value={props.value || ""}
      onChange={event => props.onChange(event.target.value)}
      onBlur={event => {
        props.onValidTime(
          humanizeTimeStamp(parseTimeFromString(event.target.value))
        );
      }}
    />
  );

  // return (
  //   <Select
  //     label={props.label}
  //     options={options}
  //     value={getValue(props.value)}
  //     onChange={valueObject => {
  //       /*
  //         The typings in react-select make this impossible. This is a bunch hacks to get
  //         around that.
  //       */
  //       if (Array.isArray(valueObject)) {
  //         return;
  //       }

  //       const value = (valueObject as { value: number }).value;
  //       props.onChange(value);
  //     }}
  //     withDropdownIndicator={false}
  //     filterOption={filterOption}
  //     isClearable={false}
  //     onBlur={e => {
  //       const { value } = e.target as HTMLInputElement;

  //       props.onChange(parseTimeFromString(value));
  //     }}
  //   />
  // );
};
