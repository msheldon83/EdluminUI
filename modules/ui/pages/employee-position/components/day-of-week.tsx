import * as React from "react";
import { FormControlLabel, Checkbox } from "@material-ui/core";
import { DayOfWeek } from "graphql/server-types.gen";
import { getDisplayName } from "ui/components/enumHelpers";
import { useTranslation } from "react-i18next";

type Props = {
  dayOfWeek: DayOfWeek;
  scheduleDaysOfWeek: DayOfWeek[];
  disabledDaysOfWeek: DayOfWeek[];
  onCheckDayOfWeek: (dow: DayOfWeek) => void;
};

export const DayOfWeekCheckBox: React.FC<Props> = props => {
  const { t } = useTranslation();

  return (
    <FormControlLabel
      control={
        <Checkbox
          color="primary"
          checked={
            props.scheduleDaysOfWeek.find(x => x === props.dayOfWeek)
              ? true
              : false
          }
          disabled={
            props.disabledDaysOfWeek.find(x => x === props.dayOfWeek)
              ? true
              : false
          }
          onChange={() => props.onCheckDayOfWeek(props.dayOfWeek)}
        />
      }
      label={getDisplayName("dayOfWeek", props.dayOfWeek, t)}
    />
  );
};
