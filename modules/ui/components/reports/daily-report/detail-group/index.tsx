import { Grid, makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DailyReportDetail } from "./daily-report-detail";
import { Detail } from "../helpers";

type Props = {
  details: Detail[];
  panelId: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
};

export const DailyReportDetailsGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    details,
    removeSub,
    selectedDetails,
    panelId,
    updateSelectedDetails,
  } = props;
  if (details.length === 0) {
    return <></>;
  }

  const detailsDisplay = details.map((d, i) => {
    const className = [
      classes.detail,
      i % 2 == 1 ? classes.shadedRow : undefined,
    ].join(" ");

    return (
      <DailyReportDetail
        detail={d}
        className={className}
        selectedDetails={selectedDetails}
        updateSelectedDetails={updateSelectedDetails}
        removeSub={removeSub}
        key={`${panelId}-${i}`}
      />
    );
  });

  // Include a Header above all of the details if there are details
  return (
    <>
      <DesktopOnly>
        <Grid
          item
          xs={12}
          container
          className={[classes.detail, classes.detailHeader].join(" ")}
        >
          <Grid item xs={3} className={classes.detailEmployeeHeader}>
            {t("Employee")}
          </Grid>
          <Grid item xs={2}>
            {t("Reason")}
          </Grid>
          <Grid item xs={2}>
            {t("Location")}
          </Grid>
          <Grid item xs={1}>
            {t("Created")}
          </Grid>
          <Grid item xs={2}>
            {t("Substitute")}
          </Grid>
          <Grid item xs={1}>
            {t("Conf#")}
          </Grid>
        </Grid>
      </DesktopOnly>
      <MobileOnly>
        <div>
          <div className={classes.detailEmployeeHeader}>{t("Employee")}</div>
          <div>{t("Reason")}</div>
        </div>
      </MobileOnly>
      {detailsDisplay}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  detail: {
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    "@media print": {
      paddingLeft: theme.spacing(),
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
    },
  },
  detailHeader: {
    color: theme.customColors.edluminSubText,
    background: theme.customColors.lightGray,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  detailEmployeeHeader: {
    paddingLeft: theme.spacing(5),
    "@media print": {
      paddingLeft: 0,
    },
  },
}));
