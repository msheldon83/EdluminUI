import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { useQueryBundle, HookQueryResult } from "graphql/hooks";
import {
  GetContractScheduleDates,
  GetContractScheduleDatesQuery,
  GetContractScheduleDatesQueryVariables,
} from "../graphql/get-contract-schedule-dates.gen";
import {
  parseISO,
  startOfDay,
  isSameDay,
  addMonths,
  endOfMonth,
  format,
  isEqual,
} from "date-fns";
import { useMemo } from "react";
import { CalendarDayType } from "graphql/server-types.gen";
import { differenceWith, uniq } from "lodash-es";

type Props = {
  contractId: string;
  vacancySelectedDates: Date[];
  onSelectDates: (dates: Array<Date>) => void;
  month: Date;
  onMonthChange: (d: Date) => void;
};

export const VacancyDateSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const inputRef = React.useRef(null);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [disabledDates, setDisabledDates] = React.useState<Date[]>([]);
  const {
    contractId,
    vacancySelectedDates,
    onSelectDates,
    month,
    onMonthChange,
  } = props;

  // If the contractId changes, then clear out the disabled dates we have in state
  React.useEffect(() => {
    setDisabledDates([]);
  }, [contractId]);

  const getContractScheduleDates = useQueryBundle(GetContractScheduleDates, {
    variables: {
      contractId: contractId,
      fromDate: format(addMonths(month, -1), "yyyy-M-d"),
      toDate: format(endOfMonth(addMonths(month, 2)), "yyyy-M-d"),
    },
  });
  React.useEffect(() => {
    if (getContractScheduleDates.state === "DONE") {
      const computedDisabledDates = computeDisabledDates(
        getContractScheduleDates
      );
      setDisabledDates(current => {
        const datesToAdd = computedDisabledDates.filter(
          cdd => !current.find(c => isEqual(c, cdd))
        );
        return [...current, ...datesToAdd];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getContractScheduleDates.state]);

  const customSelectedVacancyDates = useMemo(
    () =>
      vacancySelectedDates.map(date => {
        return {
          date,
          buttonProps: {
            className: `${classes.selectedAbsenceDate} selectedAbsenceDate`,
          },
        };
      }),
    [vacancySelectedDates, classes.selectedAbsenceDate]
  );

  const customDates = useMemo(
    () =>
      disabledDates
        .map(date => {
          return {
            date,
            buttonProps: { className: `${classes.dateDisabled} dateDisabled` },
          };
        })
        .concat(customSelectedVacancyDates),

    [classes.dateDisabled, customSelectedVacancyDates, disabledDates]
  );

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const input = inputRef.current as HTMLInputElement | null;
    input?.focus();
    /*
      Manually trigger the focus event because sometimes it's already focused
      when it's a single select and the dropdown needs to reopen
    */
    input?.dispatchEvent(new Event("focus"));
    setCalendarOpen(!calendarOpen);
  };

  const handleSelectDates = (dates: Date[]) => {
    /*
      If more than one date is selected, the first date is dropped because
      that one is already marked as selected in the state management. This keeps
      it from being toggled off for this multi-date selection
    */
    const [initialDate, ...restOfDates] = dates;
    const datesSelected = dates.length > 1 ? restOfDates : [initialDate];
    // Remove any disabled dates from the list
    const validDates = differenceWith(datesSelected, disabledDates, (a, b) =>
      isSameDay(a, b)
    );
    onSelectDates(validDates);
  };

  return (
    <>
      <div className={classes.calendarContainer}>
        <CustomCalendar
          variant="month"
          customDates={customDates}
          previousMonthNavigation={true}
          nextMonthNavigation={true}
          onSelectDates={handleSelectDates}
          month={month}
          onMonthChange={onMonthChange}
        />
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  dateDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  existingDate: {
    backgroundColor: theme.customColors.lightBlue,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightBlue,
      color: theme.palette.text.disabled,
    },
  },
  selectedAbsenceDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },

  arrowDownIcon: {
    color: theme.customColors.edluminSubText,
    cursor: "pointer",
    zIndex: 200,
  },
  calendarContainer: {
    width: theme.typography.pxToRem(500),
    zIndex: 1500,
  },
}));

const computeDisabledDates = (
  queryResult: HookQueryResult<
    GetContractScheduleDatesQuery,
    GetContractScheduleDatesQueryVariables
  >
) => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }
  const dates = new Set<Date>();
  queryResult.data.contractSchedule?.contractScheduleDates?.forEach(
    contractDate => {
      switch (contractDate?.calendarDayTypeId) {
        case CalendarDayType.TeacherWorkDay:
        case CalendarDayType.CancelledDay:
        case CalendarDayType.Invalid:
        case CalendarDayType.NonWorkDay: {
          const theDate = startOfDay(parseISO(contractDate.date));
          dates.add(theDate);
        }
      }
    }
  );
  return [...dates];
};
