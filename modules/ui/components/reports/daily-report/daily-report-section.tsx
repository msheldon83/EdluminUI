import * as React from "react";
import {
  makeStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
} from "@material-ui/core";
import { DetailGroup, Detail } from "./helpers";
import { ExpandMore } from "@material-ui/icons";
import { DailyReportDetailsGroup } from "./detail-group";

import { useIsMobile } from "hooks";

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
  const isMobile = useIsMobile();
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
                    <DailyReportDetailsGroup
                      panelId={subGroupPanelId}
                      removeSub={props.removeSub}
                      updateSelectedDetails={props.updateSelectedDetails}
                      selectedDetails={props.selectedDetails}
                      details={s.details ?? []}
                    />
                    {/* {isMobile ? (
                      <MobileDailyReportDetailsGroup
                        panelId={subGroupPanelId}
                        removeSub={props.removeSub}
                        updateSelectedDetails={props.updateSelectedDetails}
                        selectedDetails={props.selectedDetails}
                        details={s.details ?? []}
                      />
                    ) : (
                      <DailyReportDetailsGroup
                        panelId={subGroupPanelId}
                        removeSub={props.removeSub}
                        updateSelectedDetails={props.updateSelectedDetails}
                        selectedDetails={props.selectedDetails}
                        details={s.details ?? []}
                      />
                    )} */}
                    {/* {getDetailsDisplay(
                      s.details ?? [],
                      subGroupPanelId,
                      classes,
                      t,
                      props.selectedDetails,
                      props.updateSelectedDetails,
                      props.removeSub
                    )} */}
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        {!hasSubGroups && (
          <Grid container alignItems="flex-start">
            <DailyReportDetailsGroup
              panelId={panelId}
              removeSub={props.removeSub}
              updateSelectedDetails={props.updateSelectedDetails}
              selectedDetails={props.selectedDetails}
              details={detailGroup.details ?? []}
            />
            {/* {isMobile ? (
              <MobileDailyReportDetailsGroup
                panelId={panelId}
                removeSub={props.removeSub}
                updateSelectedDetails={props.updateSelectedDetails}
                selectedDetails={props.selectedDetails}
                details={detailGroup.details ?? []}
              />
            ) : (
              <DailyReportDetailsGroup
                panelId={panelId}
                removeSub={props.removeSub}
                updateSelectedDetails={props.updateSelectedDetails}
                selectedDetails={props.selectedDetails}
                details={detailGroup.details ?? []}
              />
            )} */}
            {/* {getDetailsDisplay(
              detailGroup.details ?? [],
              panelId,
              classes,
              t,
              props.selectedDetails,
              props.updateSelectedDetails,
              props.removeSub
            )} */}
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
}));
