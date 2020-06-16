import { Grid, makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DailyReportDetail } from "./daily-report-detail";
import { Detail } from "../helpers";
import { DesktopOnly, MobileOnly } from "ui/components/mobile-helpers";
import clsx from "clsx";
import { useIsMobile } from "hooks";

type Props = {
  details: Detail[];
  panelId: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
  vacancyDate?: string;
  swapSubs?: (detail: Detail) => void;
};

export const DailyReportDetailsGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const {
    details,
    removeSub,
    selectedDetails,
    panelId,
    updateSelectedDetails,
  } = props;

  const hasClosedAbs = React.useMemo(() => {
    return details.filter(d => d.isClosed).length > 0;
  }, [details]);

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
        vacancyDate={hasClosedAbs ? props.vacancyDate : undefined}
        swapSubs={props.swapSubs}
      />
    );
  });
  const headerClasses = clsx({
    [classes.detailHeader]: true,
    [classes.mobileHeader]: isMobile,
    [classes.detail]: !isMobile,
  });

  // Include a Header above all of the details if there are details
  return (
    <>
      <DesktopOnly>
        <div className={headerClasses}>
          {hasClosedAbs && <div className={classes.closedSection}></div>}
          <div className={classes.employeeSection}>{t("Employee")}</div>
          <div className={classes.reasonSection}>{t("Reason")}</div>
          <div className={classes.locationSection}>{t("School")}</div>
          <div className={classes.date}>{t("Created")}</div>
          <div className={classes.substituteSection}>{t("Substitute")}</div>
          <div className={classes.confirmationNumber}>{t("Conf#")}</div>
          <div className={classes.approvalChip}></div>
          <div className={classes.actionColumn}></div>
        </div>
      </DesktopOnly>
      <MobileOnly>
        <div className={headerClasses}>
          <div className={classes.checkboxSpacing} />
          <div className={classes.headerItem}>{t("Employee")}</div>
          <div className={classes.headerItem}>{t("Reason")}</div>
        </div>
      </MobileOnly>
      {detailsDisplay}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  employeeSection: {
    display: "flex",
    flex: 7,
    paddingLeft: theme.spacing(5),
    "@media print": {
      paddingLeft: 0,
    },
  },
  locationSection: {
    display: "flex",
    flex: 7,
  },
  closedSection: {
    display: "flex",
    flex: 2,
  },
  reasonSection: {
    display: "flex",
    flex: 4,
  },
  substituteSection: {
    display: "flex",
    flex: 6,
  },
  date: {
    flex: 4,
  },
  approvalChip: {
    flex: 2,
  },
  confirmationNumber: {
    width: "120px",
  },
  actionColumn: {
    width: theme.typography.pxToRem(85),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  detail: {
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(1),
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
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      alignItems: "stretch",
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
  checkboxSpacing: { width: theme.typography.pxToRem(42), flexGrow: 0 },
  mobileHeader: {
    display: "flex",
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  headerItem: { flex: 1 },
}));
