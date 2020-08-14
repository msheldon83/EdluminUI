import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Typography, Chip, Grid } from "@material-ui/core";
import { PermissionEnum, CalendarDayType } from "graphql/server-types.gen";
import { parseISO, format } from "date-fns";
import { useContracts } from "reference-data/contracts";
import { useTranslation } from "react-i18next";
import { OptionType } from "ui/components/form/select-new";
import { Can } from "ui/components/auth/can";
import { getCalendarSummaryText } from "../helpers";
import clsx from "clsx";
import { CalendarEvent } from "../types";

type Props = {
  locationOptions: OptionType[];
  contractOptions: OptionType[];
  calendarChange: CalendarEvent;
  orgId: string;
  onDelete: (calendarChange: CalendarEvent, date?: Date) => Promise<void>;
  onAdd: (date: string) => void;
  onEdit: (calendarChange: CalendarEvent, date?: Date) => void;
  date: Date;
};

export const CalendarChangeRow: React.FC<Props> = props => {
  const classes = useStyles();
  const contracts = useContracts(props.orgId);
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { calendarChange, contractOptions, locationOptions } = props;

  const eventTextSummary = getCalendarSummaryText(
    locationOptions,
    contractOptions,
    calendarChange.affectsAllContracts ?? false,
    calendarChange.affectsAllLocations ?? false,
    calendarChange.changedContracts &&
      calendarChange?.changedContracts?.length !== 0
      ? calendarChange!.changedContracts!.map(c => c!.id)
      : [],
    calendarChange.locationIds && calendarChange?.locationIds?.length !== 0
      ? calendarChange!.locationIds!.map(c => c!)
      : [],
    t
  );

  const formatDateRange = (startDate: string, endDate: string) => {
    const sd = parseISO(startDate);
    const ed = parseISO(endDate);
    const sameMonth = format(sd, "MMM") === format(ed, "MMM");
    if (sameMonth) {
      return `${format(sd, "MMM d")} - ${format(ed, "d")}`;
    } else {
      return `${format(sd, "MMM d")} - ${format(ed, "MMM d")}`;
    }
  };

  const calendarDayType = calendarChange?.calendarChangeReason
    ?.calendarDayTypeId as CalendarDayType;

  const dateSubText =
    calendarChange.startDate !== calendarChange.endDate
      ? `${formatDateRange(calendarChange.startDate!, calendarChange.endDate!)}`
      : format(parseISO(calendarChange.startDate!), "MMM d");

  return (
    <Grid container xs={12} spacing={2} className={classes.paddingTop}>
      <Grid item xs={2}>
        <div className={classes.paddingLeft}>
          <Typography className={classes.mainText}>
            {calendarChange.description}
          </Typography>
          <Typography className={classes.subText}>{dateSubText}</Typography>
        </div>
      </Grid>
      <Grid item xs={2}>
        <Chip
          label={calendarChange.calendarChangeReason?.name}
          className={clsx({
            [classes.teacherWorkDay]:
              calendarDayType === CalendarDayType.TeacherWorkDay,
            [classes.dayOff]:
              calendarDayType === CalendarDayType.NonWorkDay ||
              calendarDayType === CalendarDayType.CancelledDay,
            [classes.modifiedSchedule]:
              calendarDayType === CalendarDayType.InstructionalDay,
          })}
        />
      </Grid>
      <Grid item xs={6}>
        <div className={classes.eventSummaryText}>{eventTextSummary}</div>
      </Grid>
      {!isDeleting && (
        <>
          <Can do={[PermissionEnum.CalendarChangeSave]}>
            <Grid item xs={1}>
              <Button
                variant="outlined"
                onClick={e => {
                  e.stopPropagation();
                  props.onEdit(calendarChange, props.date);
                }}
              >
                {t("EDIT")}
              </Button>
            </Grid>
          </Can>
          <Can do={[PermissionEnum.CalendarChangeDelete]}>
            <Grid item xs={1} classes={{ root: classes.root }}>
              <Button
                variant="outlined"
                className={classes.delete}
                onClick={async e => {
                  e.stopPropagation();
                  setIsDeleting(true);
                  await props.onDelete(calendarChange);
                  setIsDeleting(false);
                }}
              >
                {t("Delete")}
              </Button>
            </Grid>
          </Can>
        </>
      )}
      {isDeleting && (
        <Typography className={classes.mainText}>
          {t("Deleting ...")}
        </Typography>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  height: {
    height: "50px",
  },

  paddingTop: {
    paddingTop: theme.spacing(1),
  },
  container: {
    padding: theme.spacing(2),
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  floatRight: { float: "right" },
  mainText: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: 500,
  },
  eventSummaryText: {
    fontWeight: 500,
    paddingTop: "5px",
  },
  dayOff: {
    backgroundColor: "#FF5555",
    color: "white",
  },
  modifiedSchedule: {
    backgroundColor: "#FFCC01",
    color: "black",
  },
  teacherWorkDay: {
    backgroundColor: "#6471DF",
    color: "white",
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  bold: {
    fontWeight: 500,
  },
  paddingLeft: {
    paddingLeft: "15px",
  },
  text: {
    fontSize: theme.typography.pxToRem(18),
  },
  delete: {
    color: theme.customColors.darkRed,
  },
  root: {
    flexBasis: "0% !important",
    flexGrow: 0,
    maxWidth: "8.333333%",
  },
}));
