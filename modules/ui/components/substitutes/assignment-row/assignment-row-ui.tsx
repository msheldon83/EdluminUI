import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentDetailsUI } from "ui/components/substitutes/assignment-details/assignment-details-ui";

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

  return (
    <div
      className={[
        classes.container,
        isMobile ? classes.mobile : "",
        props.className,
      ].join(" ")}
    >
      <AssignmentDetailsUI {...props} locationNames={[props.locationName]} />

      {!props.forSpecificAssignment && (
        <div className={classes.confNumber}>
          <Typography className={classes.bold} noWrap>
            #C{props.confirmationNumber}
          </Typography>
        </div>
      )}
      {!props.forSpecificAssignment && (
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
  mobile: {
    flexDirection: "column",
    alignItems: "flex-start",
  },

  bold: {
    fontWeight: 500,
  },
  confNumber: { flex: 4, padding: `0 ${theme.typography.pxToRem(4)}` },
  cancel: { color: theme.customColors.darkRed },
}));
