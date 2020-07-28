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

  const detailClass = details.some(d => d.isClosed)
    ? classes.closedDetail
    : classes.detail;

  const detailsDisplay = details.map((d, i) => {
    const className = clsx(
      detailClass,
      i % 2 == 1 ? classes.shadedRow : undefined
    );

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
  const headerClasses = clsx(
    classes.detailHeader,
    isMobile ? classes.mobileHeader : detailClass
  );

  // Include a Header above all of the details if there are details
  return (
    <>
      <DesktopOnly>
        <div className={headerClasses}>
          <div className={classes.employeeSection}>{t("Employee")}</div>
          <div className={classes.reasonSection}>{t("Reason")}</div>
          <div className={classes.locationSection}>{t("School")}</div>
          <div className={classes.date}>{t("Created")}</div>
          <div className={classes.substituteSection}>{t("Substitute")}</div>
          <div className={classes.confirmationNumber}>{t("Conf#")}</div>
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
    /*
    paddingLeft: theme.spacing(5),
    "@media print": {
      paddingLeft: 0,
    },*/
    gridArea: "employee",
  },
  locationSection: {
    gridArea: "location",
  },
  closedSection: {
    gridArea: "closed",
  },
  reasonSection: {
    gridArea: "reason",
  },
  substituteSection: {
    gridArea: "substitute",
  },
  date: {
    gridArea: "date",
  },
  confirmationNumber: {
    gridArea: "confirmation",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  detail: {
    padding: theme.spacing(2),
    display: "grid",
    width: "100%",
    gridTemplate: `
      "closed employee reason location       date           substitute     confirmation   approval       action        " auto
      ".      .        .      extraLocations extraLocations extraLocations extraLocations extraLocations extraLocations" auto
      / 48px   3fr      3fr    3fr            3fr            3fr            2fr           72px           48px
    `,
    columnGap: theme.spacing(1),
  },
  closedDetail: {
    padding: theme.spacing(2),
    display: "grid",
    width: "100%",
    gridTemplate: `
      "closed employee reason location       date           substitute     confirmation   approval       action        " auto
      ".      .        .      extraLocations extraLocations extraLocations extraLocations extraLocations extraLocations" auto
      / 72px   3fr      3fr    3fr            3fr            3fr            2fr           72px           48px
    `,
    columnGap: theme.spacing(1),
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
