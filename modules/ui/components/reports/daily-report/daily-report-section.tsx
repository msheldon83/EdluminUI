import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  makeStyles,
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
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
};

type DetailsGroupProps = {
  details?: Detail[];
  parentId: string;
};

export const DailyReportSection: React.FC<Props> = props => {
  const classes = useStyles();

  const detailGroup = props.group;
  let headerText = `${detailGroup.label}`;
  if (!detailGroup.subGroups && detailGroup.details) {
    headerText = `${headerText} (${detailGroup.details.length})`;
  }
  const hasDetails = !!(detailGroup.details && detailGroup.details.length);
  const panelId = detailGroup.label;

  const DetailsGroupUI: React.FC<DetailsGroupProps> = ({
    details,
    parentId,
  }) => (
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

  return (
    <ExpansionPanel
      expanded={props.isOpen}
      onChange={(_, expanded) => props.setIsOpen(expanded)}
    >
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
        {detailGroup.subGroups ? (
          detailGroup.subGroups
            .filter(s => s.details?.length)
            .map((s, i) => {
              const details = s.details!;
              const subHeaderText = `${s.label} (${details.length})`;
              const subGroupPanelId = `${panelId}-subGroup-${i}`;

              return (
                <ExpansionPanel
                  className={classes.subDetailHeader}
                  defaultExpanded={true}
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
                    <DetailsGroupUI
                      parentId={subGroupPanelId}
                      details={details}
                    />
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              );
            })
        ) : (
          <DetailsGroupUI parentId={panelId} details={detailGroup.details} />
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
