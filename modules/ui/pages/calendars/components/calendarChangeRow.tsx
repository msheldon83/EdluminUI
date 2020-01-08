import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Typography } from "@material-ui/core";
import { CalendarChange } from "graphql/server-types.gen";
import { parseISO, format } from "date-fns";
import { useContracts } from "reference-data/contracts";
import { useTranslation } from "react-i18next";

type Props = {
  calendarChange: CalendarChange;
  orgId: string;
  onDelete: (calendarChangeId: string) => void;
  date: Date;
};

export const CalendarChangeRow: React.FC<Props> = props => {
  const classes = useStyles();
  const contracts = useContracts(props.orgId);
  const { t } = useTranslation();

  if (props.calendarChange == undefined) {
    return (
      <>
        <div className={classes.container}>
          <div className={classes.dateContainer}>
            <Typography className={classes.mainText}>
              {format(props.date, "MMM d")}
            </Typography>
            <Typography className={classes.subText}>
              {format(props.date, "EEE")}
            </Typography>
          </div>
          <div className={classes.notes}>
            <Typography className={classes.mainText}>
              {t("No Events")}
            </Typography>
          </div>
        </div>
      </>
    );
  }

  const dateLabel =
    props.calendarChange.startDate == props.calendarChange.endDate
      ? format(parseISO(props.calendarChange.startDate), "MMM d")
      : `${format(
          parseISO(props.calendarChange.startDate),
          "MMM d"
        )} - ${format(parseISO(props.calendarChange.endDate), "MMM d")}`;

  const dayLabel =
    props.calendarChange.startDate == props.calendarChange.endDate
      ? format(parseISO(props.calendarChange.startDate), "EEE")
      : `${format(parseISO(props.calendarChange.startDate), "EEE")} - ${format(
          parseISO(props.calendarChange.endDate),
          "EEE"
        )}`;

  const contractLabel =
    props.calendarChange.changedContracts?.length === 0
      ? t("All Contracts")
      : props.calendarChange.changedContracts
          ?.map((cc: any) => {
            return contracts.find(c => c.id === cc.id)?.name;
          })
          .join(",");

  return (
    <div className={classes.container}>
      <div className={classes.dateContainer}>
        <Typography className={classes.mainText}>{dateLabel}</Typography>
        <Typography className={classes.subText}>{dayLabel}</Typography>
      </div>
      <div className={classes.notes}>
        <Typography className={classes.mainText}>
          {props.calendarChange.description}
        </Typography>
        <Typography className={classes.subText}>
          {props.calendarChange.calendarChangeReason?.name}
        </Typography>
      </div>
      <div className={classes.contracts}>
        <Typography className={classes.mainText}>{contractLabel}</Typography>
      </div>
      <div className={classes.delete}>
        <Button
          variant="outlined"
          className={classes.delete}
          onClick={e => {
            e.stopPropagation();
            props.onDelete(props.calendarChange.id);
          }}
        >
          {t("Delete")}
        </Button>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateContainer: {
    flex: 4,
  },
  notes: {
    flex: 7,
  },
  contracts: {
    flex: 11,
  },
  mainText: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: 500,
  },

  subText: {
    color: theme.customColors.edluminSubText,
  },
  bold: {
    fontWeight: 500,
  },
  text: {
    fontSize: theme.typography.pxToRem(18),
  },
  delete: {
    flex: 3,
    color: theme.customColors.darkRed,
  },
}));