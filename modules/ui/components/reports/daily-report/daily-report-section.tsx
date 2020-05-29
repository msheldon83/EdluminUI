import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import * as React from "react";
import { DailyReportDetailsGroup } from "./detail-group";
import { Detail, DetailGroup } from "./helpers";

type Props = {
  group: DetailGroup;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
  vacancyDate?: string;
  swapSubs?: (detail: Detail) => void;
};

type SubGroupProps = {
  details?: Detail[];
  indent: number;
  parentId: string;
  subGroups?: DetailGroup[];
};

export const DailyReportSection: React.FC<Props> = props => {
  const classes = useStyles();
  const theme = useTheme();

  const detailGroup = props.group;
  let headerText = `${detailGroup.label}`;
  if (!detailGroup.subGroups && detailGroup.details) {
    headerText = `${headerText} (${detailGroup.details.length})`;
  }
  const hasSubGroups = !!detailGroup.subGroups;
  const hasDetails = !!(detailGroup.details && detailGroup.details.length);
  const panelId = detailGroup.label;

  const GroupDetails: React.FC<SubGroupProps> = ({
    details,
    indent,
    parentId,
    subGroups,
  }) => {
    if (subGroups) {
      return (
        <>
          {" "}
          {subGroups.map((s, i) => {
            const hasSubGroups = !!(s.subGroups && s.subGroups.length);
            const hasDetails = !!(s.details && s.details.length);
            const panelId = `${parentId}-subGroup-${i}`;
            let headerText = `${s.label}`;
            if (hasDetails) {
              headerText = `${headerText} (${s.details!.length})`;
            }
            return (
              <ExpansionPanel
                className={classes.subDetailHeader}
                defaultExpanded={hasDetails}
                key={s.label}
                classes={{
                  expanded: classes.subGroupExpanded,
                }}
              >
                <ExpansionPanelSummary
                  expandIcon={<ExpandMore />}
                  aria-label="Expand"
                  aria-controls={`${panelId}-content`}
                  id={panelId}
                  className={classes.summary}
                >
                  <div className={classes.subGroupSummaryText}>
                    {headerText}
                  </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                  <GroupDetails
                    indent={indent + 1}
                    parentId={panelId}
                    subGroups={s.subGroups}
                    details={s.details}
                  />
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        </>
      );
    }
    if (details) {
      return (
        <Grid container alignItems="flex-start">
          <DailyReportDetailsGroup
            panelId={parentId}
            removeSub={props.removeSub}
            updateSelectedDetails={props.updateSelectedDetails}
            selectedDetails={props.selectedDetails}
            details={details ?? []}
            vacancyDate={props.vacancyDate}
            swapSubs={props.swapSubs}
          />
        </Grid>
      );
    }
    return <> </>;
  };

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
        <GroupDetails
          subGroups={detailGroup.subGroups}
          details={detailGroup.details}
          indent={1}
          parentId={panelId}
        />
        {false &&
          hasSubGroups &&
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
                      vacancyDate={props.vacancyDate}
                      swapSubs={props.swapSubs}
                    />
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        {false && !hasSubGroups && (
          <Grid container alignItems="flex-start">
            <DailyReportDetailsGroup
              panelId={panelId}
              removeSub={props.removeSub}
              updateSelectedDetails={props.updateSelectedDetails}
              selectedDetails={props.selectedDetails}
              details={detailGroup.details ?? []}
              vacancyDate={props.vacancyDate}
              swapSubs={props.swapSubs}
            />
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
