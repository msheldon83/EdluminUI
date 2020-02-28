import * as React from "react";
import { Input } from "ui/components/form/input";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import {
  useMutationBundle,
  useQueryBundle,
  HookQueryResult,
} from "graphql/hooks";
import {
  GetContractScheduleDates,
  GetContractScheduleDatesQuery,
  GetContractScheduleDatesQueryVariables,
} from "../graphql/get-contract-schedule-dates.gen";
import { addDays, isAfter, parseISO, startOfDay, startOfWeek } from "date-fns";
import { useMemo, useCallback } from "react";
import { CalendarDayType } from "graphql/server-types.gen";

type Props = {
  contractId: string;
};

export const VacancyDateSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const inputRef = React.useRef(null);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const startDate = useMemo(() => startOfWeek(new Date()), []);

  const getContractScheduleDates = useQueryBundle(GetContractScheduleDates, {
    variables: {
      contractId: props.contractId,
      fromDate: startDate,
      toDate: addDays(startDate, 45),
    },
  });
  console.log(getContractScheduleDates);
  const disabledDates = useMemo(
    () =>
      computeDisabledDates(getContractScheduleDates).map(date => {
        return {
          date,
          buttonProps: { className: classes.dateDisabled },
        };
      }),
    [getContractScheduleDates]
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

  return (
    <>
      <Input
        label={t("Dates")}
        placeholder={t("Enter vacancy dates")}
        endAdornment={
          <ArrowDropDownIcon
            onClick={handleArrowClick}
            className={classes.arrowDownIcon}
          />
        }
        onFocus={e => {
          setCalendarOpen(true);
        }}
        onBlur={e => {
          setCalendarOpen(false);
        }}
        onClick={() => setCalendarOpen(true)}
      />
      {calendarOpen && (
        <CustomCalendar variant="month" customDates={disabledDates} />
      )}
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
  selectContainer: {
    position: "relative",
    zIndex: 100,

    "&.active": {
      zIndex: 200,
    },
  },
  selectContainerDisabled: {
    pointerEvents: "none",
    cursor: "not-allowed",
  },
  inputContainer: {
    cursor: "text",
    fontSize: theme.typography.pxToRem(14),

    "& Input": {
      cursor: "text",
    },
  },

  dropdownContainer: {
    position: "relative",
  },
  attachedInput: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  arrowDownIcon: {
    color: theme.customColors.edluminSubText,
    cursor: "pointer",
    zIndex: 200,
  },
  listbox: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      4
    )} ${theme.typography.pxToRem(4)}`,
    borderTopWidth: 0,
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(32),
    listStyle: "none",
    margin: 0,
    maxHeight: 200,
    overflow: "auto",
    padding: 0,
    paddingBottom: theme.spacing(1.5),
    position: "absolute",
    top: "calc(100% - 2px)",
    width: "100%",
    zIndex: 100,
  },
  optionItem: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),

    "&:hover": {
      color: theme.palette.text.primary,
      cursor: "pointer",
    },
    '&[aria-selected="true"]': {
      backgroundColor: theme.customColors.yellow1,
      cursor: "pointer",
    },
  },
  resetLabel: {
    color: theme.customColors.edluminSubText,

    '&[aria-selected="true"]': {
      color: theme.customColors.edluminSubText,
    },
  },
  showAllButton: {
    position: "absolute",
    height: "100%",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,

    "&:after": {
      content: "''",
      position: "absolute",
      top: 0,
      right: 0,
      background:
        "linear-gradient(270deg, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 100%)",
      height: "100%",
      width: "200%",
      zIndex: -1,
    },
  },
  selectedChips: {
    boxSizing: "border-box",
    display: "flex",
    flexWrap: "wrap",
    marginTop: theme.spacing(1),
    height: theme.typography.pxToRem(36),
    maxHeight: theme.typography.pxToRem(36),
    lineHeight: theme.typography.pxToRem(36),
    overflow: "hidden",
    position: "relative",
  },
  showAllSelectedChips: {
    height: "auto",
    maxHeight: theme.typography.pxToRem(999999),
  },
  selectionChip: {
    backgroundColor: theme.customColors.yellow4,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    position: "relative",

    "& svg": {
      color: theme.customColors.white,
      position: "relative",
      transition: "color 100ms linear",
      zIndex: 2,

      "&:hover": {
        color: theme.customColors.white,
      },
    },

    "&::after": {
      display: "inline-block",
      content: "''",
      width: theme.typography.pxToRem(8),
      height: theme.typography.pxToRem(8),
      backgroundColor: "rgba(0,0,0,1)",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      right: theme.typography.pxToRem(12),
      zIndex: 1,
    },
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
