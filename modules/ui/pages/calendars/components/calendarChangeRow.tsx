import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Button, Typography } from "@material-ui/core";
import { CalendarChange, PermissionEnum } from "graphql/server-types.gen";
import { parseISO, format } from "date-fns";
import { useContracts } from "reference-data/contracts";
import { useTranslation } from "react-i18next";
import { Can } from "ui/components/auth/can";
import { CalendarEvent } from "../types";

type Props = {
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

  if (
    props.calendarChange == undefined ||
    !props.calendarChange.calendarChangeReasonId
  ) {
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
          <div className={classes.contracts}></div>
          <Can do={[PermissionEnum.CalendarChangeSave]}>
            <div className={classes.add}>
              <Button
                variant="outlined"
                onClick={e => {
                  e.stopPropagation();
                  props.onAdd(props.date.toISOString());
                }}
              >
                {t("ADD EVENT")}
              </Button>
            </div>
          </Can>
        </div>
      </>
    );
  }
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

  const descriptionLabel =
    props.calendarChange.startDate !== props.calendarChange.endDate
      ? `${props.calendarChange.description ?? ""} (${formatDateRange(
          props.calendarChange.startDate!,
          props.calendarChange.endDate!
        )})`
      : props.calendarChange.description;

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
      <div className={classes.notes}>
        <Typography className={classes.mainText}>{descriptionLabel}</Typography>
        <Typography className={classes.subText}>
          {props.calendarChange.calendarChangeReason?.name}
        </Typography>
      </div>
      <div className={classes.contracts}>
        <Typography className={classes.mainText}>{contractLabel}</Typography>
      </div>
      {!isDeleting && (
        <>
          <Can do={[PermissionEnum.CalendarChangeSave]}>
            <div className={classes.edit}>
              <Button
                variant="outlined"
                className={classes.edit}
                onClick={e => {
                  e.stopPropagation();
                  props.onEdit(props.calendarChange, props.date);
                }}
              >
                {t("EDIT")}
              </Button>
            </div>
          </Can>
          <Can do={[PermissionEnum.CalendarChangeDelete]}>
            <div className={classes.delete}>
              <Button
                variant="outlined"
                className={classes.delete}
                onClick={async e => {
                  e.stopPropagation();
                  setIsDeleting(true);
                  await props.onDelete(props.calendarChange);
                  setIsDeleting(false);
                }}
              >
                {t("Delete")}
              </Button>
            </div>
          </Can>
        </>
      )}
      {isDeleting && (
        <Typography className={classes.mainText}>
          {t("Deleting ...")}
        </Typography>
      )}
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
    flex: 2,
    color: theme.customColors.darkRed,
  },
  add: {
    flex: 3,
  },
  edit: {
    flex: 1,
    marginRight: theme.spacing(1),
  },
}));
