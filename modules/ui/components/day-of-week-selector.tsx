import * as React from "react";
import { FormControlLabel, Checkbox, makeStyles } from "@material-ui/core";
import { DayOfWeek } from "graphql/server-types.gen";
import { getDisplayName } from "ui/components/enumHelpers";
import { useTranslation } from "react-i18next";

type Props = {
  daysOfWeek: Array<DayOfWeek | null>;
  disabledDaysOfWeek?: Array<DayOfWeek | null>;
  onCheckDayOfWeek: (dow: DayOfWeek) => void;
};

export const DayOfWeekSelector: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const days = Object.values(DayOfWeek);

  return (
    <div className={classes.daysOfWeekContainer}>
      {days.map((day, i) => {
        return (
          <FormControlLabel
            key={i}
            control={
              <Checkbox
                color="primary"
                checked={props.daysOfWeek.find(x => x === day) ? true : false}
                disabled={
                  props.disabledDaysOfWeek?.find(x => x === day) ? true : false
                }
                onChange={() => props.onCheckDayOfWeek(day)}
              />
            }
            label={getDisplayName("dayOfWeek", day, t)}
          />
        );
      })}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  daysOfWeekContainer: {
    display: "flex",
  },
}));
