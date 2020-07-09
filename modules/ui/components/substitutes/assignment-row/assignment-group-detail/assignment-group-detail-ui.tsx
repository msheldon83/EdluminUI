import { makeStyles, Typography } from "@material-ui/core";
import { formatIsoDateIfPossible } from "helpers/date";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { DetailDayPartDisplay } from "ui/components/substitutes/detail-day-part-display";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import { MobileOnly, DesktopOnly } from "ui/components/mobile-helpers";

type Props = {
  locationName: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  payInfoLabel: string;
  shadeRow: boolean;
  onCancel: () => void;
  className?: string;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
  canCancel?: boolean;
};

export const AssignmentGroupDetailUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div
      className={[
        classes.container,
        props.shadeRow ? classes.shadedRow : classes.unshadedRow,
        props.className,
      ].join(" ")}
    >
      <DesktopOnly>
        <div className={classes.date}>
          <Typography className={classes.text}>
            {formatIsoDateIfPossible(props.startTimeLocal, "EEE, MMM d")}
          </Typography>
        </div>

        <div className={classes.location}>
          <Typography className={classes.text}>{props.locationName}</Typography>
        </div>

        <DetailDayPartDisplay
          dayPortion={props.dayPortion}
          payInfoLabel={props.payInfoLabel}
          startTimeLocal={props.startTimeLocal}
          endTimeLocal={props.endTimeLocal}
          iconClassName={classes.smallDayIcon}
          className={classes.dayPortion}
        />

        {props.canCancel && (
          <TextButton
            className={classes.cancel}
            onClick={event => {
              event.stopPropagation();
              props.onCancel();
            }}
          >
            {t("Cancel")}
          </TextButton>
        )}
      </DesktopOnly>

      <MobileOnly>
        <div className={classes.dateAndDayPartContainer}>
          <div className={classes.date}>
            <Typography className={classes.text}>
              {formatIsoDateIfPossible(props.startTimeLocal, "EEE, MMM d")}
            </Typography>
          </div>

          <DetailDayPartDisplay
            dayPortion={props.dayPortion}
            payInfoLabel={props.payInfoLabel}
            endTimeLocal={props.endTimeLocal}
            startTimeLocal={props.startTimeLocal}
            iconClassName={classes.smallDayIcon}
            className={classes.dayPortion}
          />
        </div>

        <div className={classes.locationAndCancelContainer}>
          <Typography className={classes.text}>{props.locationName}</Typography>
          {props.canCancel && (
            <TextButton
              className={classes.cancel}
              onClick={event => {
                event.stopPropagation();
                props.onCancel();
              }}
            >
              {t("Cancel")}
            </TextButton>
          )}
        </div>
      </MobileOnly>
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: theme.typography.pxToRem(4),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "inherit",
    },
  },
  text: {
    color: theme.customColors.edluminSubText,
    fontSize: theme.typography.fontSize,
  },
  shadedRow: {
    background: theme.customColors.lighterGray,
  },
  unshadedRow: {
    background: theme.customColors.white,
  },
  dayPortion: {
    display: "flex",
    alignItems: "center",
    flex: 7,
    [theme.breakpoints.down("sm")]: {
      flex: 5,
    },
  },
  smallDayIcon: {
    width: theme.typography.pxToRem(16),
    margin: theme.spacing(1),
  },
  date: {
    flex: 2,
  },
  location: {
    flex: 8,
  },
  cancel: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.darkRed,
    textDecoration: "underline",
    fontWeight: 400,
  },
  dateAndDayPartContainer: {
    display: "flex",
    alignItems: "center",
  },
  locationAndCancelContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));
