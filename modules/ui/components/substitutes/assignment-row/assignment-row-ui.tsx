import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentDetailsUI } from "ui/components/substitutes/assignment-details/assignment-details-ui";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import { NotesPopper } from "../notes-popper";
import { parseISO, isFuture } from "date-fns";

type Props = {
  startDate: string;
  endDate: string;
  startTime: string;
  locationName: string;
  organizationName?: string;
  positionName: string;
  employeeName: string;
  dayPortion: number;
  payInfoLabel: string;
  confirmationNumber: string;
  notesToReplacement?: string;
  onCancel: () => void;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
  className?: string;
} /* If there are various times within the vacancy, we
     do not want to give false information. However, we still need
     a startTime to determine which day icon to use.
   */ & (
  | {
      multipleTimes: true;
    }
  | {
      multipleTimes: false;
      endTime: string;
    }
);

export const AssignmentRowUI: React.FC<Props> = props => {
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const inFuture = isFuture(parseISO(props.startDate));

  return (
    <div className={[classes.container, props.className].join(" ")}>
      <div className={classes.infoContainer}>
        <AssignmentDetailsUI {...props} locationNames={[props.locationName]} />
      </div>

      {!props.forSpecificAssignment && (
        <div className={classes.actionContainer}>
          <div className={classes.notes}>
            {props.notesToReplacement && (
              <NotesPopper notes={props.notesToReplacement} />
            )}
          </div>
          <div
            className={[
              classes.actionItem,
              isMobile ? classes.mobileConf : "",
            ].join(" ")}
          >
            <Typography className={classes.bold} noWrap>
              #C{props.confirmationNumber}
            </Typography>
          </div>
          {props.isAdmin || inFuture && (
            <Can do={[PermissionEnum.AbsVacRemoveSub]}>
            <div className={classes.actionItem}>
              <Button
                variant="outlined"
                className={classes.cancel}
                onClick={e => {
                  e.stopPropagation();
                  props.onCancel();
                }}
              >
                {t("Cancel")}
              </Button>
            </div>
          </Can>
          )}          
        </div>
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
    [theme.breakpoints.down("sm")]: {
      alignItems: "stretch",
    },
  },

  bold: {
    fontWeight: 500,
  },
  notes: {
    flex: 1,
    [theme.breakpoints.down("sm")]: {
      flex: 0,
    },
  },
  actionItem: { flex: 2, padding: `0 ${theme.typography.pxToRem(4)}` },
  cancel: { color: theme.customColors.darkRed },
  infoContainer: {
    display: "flex",
    justifyContent: "space-between",
    flex: 3,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  actionContainer: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-around",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "space-between",
      flexDirection: "column-reverse",
    },
  },
  mobileConf: {
    display: "flex",
    alignItems: "flex-end",
  },
}));
