import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
} from "@material-ui/core";
import { DetailGroup, Detail } from "./helpers";
import { ExpandMore } from "@material-ui/icons";
import { TFunction } from "i18next";
import { DailyReportDetail } from "./daily-report-detail";

type Props = {
  group: DetailGroup;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
};

export const DailyReportSection: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const detailGroup = props.group;
  let headerText = `${detailGroup.label}`;
  if (!detailGroup.subGroups && detailGroup.details) {
    headerText = `${headerText} (${detailGroup.details.length})`;
  }
  const hasSubGroups = !!detailGroup.subGroups;
  const hasDetails = !!(detailGroup.details && detailGroup.details.length);
  const panelId = detailGroup.label;

  return (
    <ExpansionPanel defaultExpanded={hasDetails}>
      <ExpansionPanelSummary
        expandIcon={hasDetails ? <ExpandMore /> : undefined}
        aria-label="Expand"
        aria-controls={`${panelId}-content`}
        id={panelId}
        className={classes.summary}
      >
        <div className={classes.summaryText}>{headerText}</div>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details}>
        {hasSubGroups &&
          detailGroup.subGroups!.map((s, i) => {
            const subGroupHasDetails = !!(s.details && s.details.length);
            let subHeaderText = `${s.label}`;
            if (subGroupHasDetails) {
              subHeaderText = `${subHeaderText} (${s.details!.length})`;
            }
            const subGroupPanelId = `${panelId}-subGroup-${i}`;

            return (
              <ExpansionPanel
                className={classes.subDetailHeader}
                defaultExpanded={subGroupHasDetails}
                key={`subGroup-${i}`}
                classes={{
                  expanded: classes.subGroupExpanded,
                }}
              >
                <ExpansionPanelSummary
                  expandIcon={<ExpandMore />}
                  aria-label="Expand"
                  aria-controls={`${subGroupPanelId}-content`}
                  id={subGroupPanelId}
                  className={classes.summary}
                >
                  <div className={classes.subGroupSummaryText}>
                    {subHeaderText}
                  </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                  <Grid container alignItems="flex-start">
                    {getDetailsDisplay(
                      s.details ?? [],
                      subGroupPanelId,
                      classes,
                      t,
                      props.selectedDetails,
                      props.updateSelectedDetails,
                      props.removeSub
                    )}
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        {!hasSubGroups && (
          <Grid container alignItems="flex-start">
            {getDetailsDisplay(
              detailGroup.details ?? [],
              panelId,
              classes,
              t,
              props.selectedDetails,
              props.updateSelectedDetails,
              props.removeSub
            )}
          </Grid>
        )}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

const useStyles = makeStyles(theme => ({
  summary: {
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
    height: theme.typography.pxToRem(16),
    "@media print": {
      paddingLeft: theme.spacing(),
      minHeight: `${theme.typography.pxToRem(30)} !important`,
    },
  },
  summaryText: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  subGroupSummaryText: {
    fontWeight: "bold",
    paddingLeft: theme.spacing(2),
    "@media print": {
      paddingLeft: 0,
    },
  },
  subGroupExpanded: {
    borderTop: "0 !important",
    margin: "0 !important",
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  details: {
    padding: 0,
    display: "block",
  },
  subDetailHeader: {
    width: "100%",
  },
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

const getDetailsDisplay = (
  details: Detail[],
  panelId: string,
  classes: any,
  t: TFunction,
  selectedDetails: Detail[],
  updateSelectedDetails: (detail: Detail, add: boolean) => void,
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>
) => {
  if (details.length === 0) {
    return;
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
      {detailsDisplay}
    </>
  );
};
