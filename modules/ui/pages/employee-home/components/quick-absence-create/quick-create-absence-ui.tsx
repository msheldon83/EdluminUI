import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Grid,
  Checkbox,
  Link,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Select } from "ui/components/form/select";
import { DayPartField } from "ui/components/absence/day-part-field";
import { FieldError } from "react-hook-form/dist/types";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { FiveWeekCalendar } from "ui/components/form/five-week-calendar";

type Props = {
  organizationId: string;
  absenceReason: string;
  absenceReasonOptions: { value: string; label: string }[];
  onAbsenceReasonChange: (event: any) => Promise<void>;
  absenceReasonError?: FieldError;
  currentMonth: Date;
  viewPreviousMonth: () => void;
  viewNextMonth: () => void;
  absenceDates: Date[];
  disabledDates: Date[];
  onToggleAbsenceDate: (date: Date) => void;
};

export const QuickAbsenceCreateUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    absenceReason,
    absenceReasonOptions,
    onAbsenceReasonChange,
    absenceReasonError,
    viewPreviousMonth,
    viewNextMonth,
    absenceDates,
    disabledDates,
    onToggleAbsenceDate,
    currentMonth,
  } = props;

  return (
    <>
      <div className={classes.select}>
        <Typography>{t("Select a reason")}</Typography>
        <Select
          value={{
            value: absenceReason,
            label:
              absenceReasonOptions.find(a => a.value === absenceReason)
                ?.label || "",
          }}
          onChange={onAbsenceReasonChange}
          options={absenceReasonOptions}
          isClearable={false}
          inputStatus={absenceReasonError ? "error" : undefined}
          validationMessage={absenceReasonError?.message}
        />
      </div>

      <div className={classes.monthSwitcher}>
        <IconButton onClick={viewPreviousMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={viewNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </div>

      <FiveWeekCalendar
        startDate={currentMonth}
        disabledDates={disabledDates}
        selectedDates={absenceDates}
        onDateClicked={onToggleAbsenceDate}
      />

      {/* <DayPartField /> */}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  select: {
    paddingTop: theme.typography.pxToRem(4),
    paddingBottom: theme.spacing(1),
  },
  monthSwitcher: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));
