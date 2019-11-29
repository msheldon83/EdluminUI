import * as React from "react";
import {
  Grid,
  makeStyles,
  Divider,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  FormControlLabel,
  Checkbox,
  Link,
} from "@material-ui/core";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { useQueryParamIso } from "hooks/query-params";
import { useQueryBundle } from "graphql/hooks";
import { GetDailyReport } from "./graphql/get-daily-report.gen";
import { GetTotalContractedEmployeeCount } from "./graphql/get-total-employee-count.gen";
import { FilterQueryParams } from "./filters/filter-params";
import { Filters } from "./filters/index";
import { FilterList, ExpandMore } from "@material-ui/icons";
import { Section } from "ui/components/section";
import { DailyReport as DailyReportType } from "graphql/server-types.gen";
import { SectionHeader } from "ui/components/section-header";
import clsx from "clsx";
import {
  Detail,
  MapDailyReportDetails,
  GetUnfilled,
  GetFilled,
  GetNoSubRequired,
  CardType,
  DailyReportDetails,
  DetailGroup,
} from "./helpers";
import { GroupCard } from "./group-card";
import { TFunction } from "i18next";
import { ActionMenu } from "ui/components/action-menu";

type Props = {
  orgId: string;
  header: string;
  showFilters?: boolean;
  cards: CardType[];
};

export const DailyReport: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [filters] = useQueryParamIso(FilterQueryParams);
  const [selectedCard, setSelectedCard] = useState<CardType | undefined>();

  const serverQueryFilters = useMemo(() => filters, [
    filters.date,
    filters.locationIds,
    filters.positionTypeIds,
  ]);
  const getDailyReport = useQueryBundle(GetDailyReport, {
    variables: {
      date: serverQueryFilters.date,
      locationIds: serverQueryFilters.locationIds,
      positionTypeIds: serverQueryFilters.positionTypeIds,
      orgId: props.orgId,
    },
  });

  const getTotalContractedEmployeeCount = useQueryBundle(
    GetTotalContractedEmployeeCount,
    {
      variables: {
        orgId: props.orgId,
        contractedOn: filters.date,
      },
    }
  );

  const dailyReportDetails = (getDailyReport.state === "LOADING" ||
  getDailyReport.state === "UPDATING"
    ? undefined
    : getDailyReport.data?.absence?.dailyReport) as DailyReportType;

  let allDetails: Detail[] = [];
  let groupedDetails: DetailGroup[] = [];

  if (dailyReportDetails) {
    const mappedDetails = MapDailyReportDetails(
      dailyReportDetails,
      new Date(filters.date),
      filters.showAbsences,
      filters.showVacancies,
      filters.groupByFillStatus,
      filters.groupByPositionType,
      t
    );
    allDetails = mappedDetails.allDetails;
    groupedDetails = mappedDetails.groups;
  }

  const totalCount = dailyReportDetails?.totalCount ?? 0;
  const totalContractedEmployeeCount = useMemo(() => {
    if (
      !(
        getTotalContractedEmployeeCount.state === "DONE" ||
        getTotalContractedEmployeeCount.state === "UPDATING"
      )
    ) {
      return null;
    }

    return Number(
      getTotalContractedEmployeeCount.data?.employee?.paged?.totalCount
    );
  }, [getTotalContractedEmployeeCount]);

  return (
    <Section>
      <SectionHeader title={props.header} />
      {props.showFilters && (
        <>
          <Filters orgId={props.orgId} />
          <Divider />
        </>
      )}
      <Grid container spacing={4} className={classes.cardContainer}>
        {props.cards.map((c, i) => {
          return (
            <Grid item key={i} className={classes.card}>
              <GroupCard
                cardType={c}
                details={allDetails}
                totalContractedEmployeeCount={totalContractedEmployeeCount}
                onClick={(c: CardType) => {
                  setSelectedCard(c === "total" ? undefined : c);
                }}
                activeCard={selectedCard}
              />
            </Grid>
          );
        })}
      </Grid>
      {displaySections(groupedDetails, selectedCard, classes, t, () =>
        setSelectedCard(undefined)
      )}
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  cardContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  card: {
    flexGrow: 1,
  },
  detailGroup: {
    marginTop: theme.spacing(2),
  },
  summary: {
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
    height: theme.typography.pxToRem(16),
  },
  summaryText: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  subGroupSummaryText: {
    fontWeight: "bold",
  },
  subGroupExpanded: {
    border: "0 !important",
    margin: "0 !important",
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
  },
  details: {
    padding: 0,
    display: "block",
  },
  detail: {
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  employeeSection: {
    display: "flex",
  },
  detailSubText: {
    color: theme.customColors.edluminSubText,
  },
  detailActionsSection: {
    textAlign: "right",
  },
  action: {
    cursor: "pointer",
  },
  alternatingRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  subDetailHeader: {
    width: "100%",
  },
}));

const displaySections = (
  groupedDetails: DetailGroup[],
  selectedCard?: CardType | undefined,
  classes: any,
  t: TFunction,
  clearSelection: () => void
) => {
  // If there is a selected card, go through each group and filter all of their data to match
  if (selectedCard) {
    groupedDetails.forEach(g => {
      if (g.subGroups) {
        g.subGroups.forEach(s => {
          if (g.details) {
            g.details = g.details.filter(d => d.state === selectedCard);
          }
        });
      } else if (g.details) {
        g.details = g.details.filter(d => d.state === selectedCard);
      }
    });
  }

  let selectedCardDisplayText = "";
  switch (selectedCard) {
    case "unfilled":
      selectedCardDisplayText = t("Showing only Unfilled absences.");
      break;
    case "filled":
      selectedCardDisplayText = t("Showing only Filled absences.");
      break;
    case "noSubRequired":
      selectedCardDisplayText = t("Showing only No sub required absences.");
      break;
  }

  // Build a display section for each group
  return (
    <div>
      {selectedCard && (
        <div>
          {selectedCardDisplayText}{" "}
          <Link className={classes.action} onClick={clearSelection}>
            {t("Show all")}
          </Link>
        </div>
      )}
      {groupedDetails.map((g, i) => {
        return (
          <div key={`group-${i}`} className={classes.detailGroup}>
            {getSectionDisplay(g, "unfilled", classes, t)}
          </div>
        );
      })}
    </div>
  );
};

const getSectionDisplay = (
  detailGroup: DetailGroup,
  panelId: string,
  classes: any,
  t: TFunction
) => {
  let headerText = `${detailGroup.label}`;
  if (!detailGroup.subGroups && detailGroup.details) {
    headerText = `${headerText} (${detailGroup.details.length})`;
  }
  const hasSubGroups = !!detailGroup.subGroups;
  const hasDetails = !!(detailGroup.details && detailGroup.details.length);

  return (
    <ExpansionPanel defaultExpanded={hasDetails}>
      <ExpansionPanelSummary
        expandIcon={hasDetails ? <ExpandMore /> : undefined}
        aria-label="Expand"
        aria-controls={`${panelId}-content`}
        id={panelId}
        className={classes.summary}
      >
        <FormControlLabel
          onClick={event => event.stopPropagation()}
          onFocus={event => event.stopPropagation()}
          control={<Checkbox color="primary" />}
          label={headerText}
          classes={{
            label: classes.summaryText,
          }}
        />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details}>
        {hasSubGroups &&
          detailGroup.subGroups!.map((s, i) => {
            const subGroupHasDetails = !!(s.details && s.details.length);
            let subHeaderText = `${s.label}`;
            if (subGroupHasDetails) {
              subHeaderText = `${subHeaderText} (${s.details!.length})`;
            }

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
                  aria-controls="additional-actions1-content"
                  id={`additional-actions1-header-${i}`}
                  className={classes.summary}
                >
                  <FormControlLabel
                    onClick={event => event.stopPropagation()}
                    onFocus={event => event.stopPropagation()}
                    control={<Checkbox color="primary" />}
                    label={subHeaderText}
                    classes={{
                      label: classes.subGroupSummaryText,
                    }}
                  />
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                  <Grid container alignItems="flex-start">
                    {getDetailsDisplay(s.details ?? [], panelId, classes, t)}
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        {!hasSubGroups && (
          <Grid container alignItems="flex-start">
            {getDetailsDisplay(detailGroup.details ?? [], panelId, classes, t)}
          </Grid>
        )}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

const getDetailsDisplay = (
  details: Detail[],
  panelId: string,
  classes: any,
  t: TFunction
) => {
  return details.map((d, i) => {
    const showAlternatingBackground = i % 2 === 1;

    return (
      <Grid
        item
        xs={12}
        container
        key={`${panelId}-${i}`}
        className={clsx({
          [classes.alternatingRow]: showAlternatingBackground,
          [classes.detail]: true,
        })}
      >
        <Grid item xs={3}>
          <div className={classes.employeeSection}>
            <Checkbox color="primary" />
            <div>
              {d.type === "absence" ? (
                <>
                  <div>{d.employee?.name}</div>
                  <div className={classes.detailSubText}>
                    {d.position?.name}
                  </div>
                </>
              ) : (
                <div>{d.position?.name}</div>
              )}
            </div>
          </div>
        </Grid>
        <Grid item xs={2}>
          <div>{d.absenceReason}</div>
          <div className={classes.detailSubText}>{d.dateRange}</div>
        </Grid>
        <Grid item xs={2}>
          <div>{d.location?.name}</div>
          <div
            className={classes.detailSubText}
          >{`${d.startTime} - ${d.endTime}`}</div>
        </Grid>
        <Grid item xs={1}>
          <div>{d.created}</div>
        </Grid>
        <Grid item xs={2}>
          {d.substitute ? (
            <>
              <div>{d.substitute.name}</div>
              <div className={classes.detailSubText}>{d.substitute.phone}</div>
            </>
          ) : (
            <Link className={classes.action}>{t("Assign")}</Link>
          )}
        </Grid>
        <Grid item xs={1}>
          <div>{d.type === "absence" ? `#${d.id}` : `#V${d.id}`}</div>
          {d.assignmentId && (
            <div className={classes.detailSubText}>{`#C${d.assignmentId}`}</div>
          )}
        </Grid>
        <Grid item xs={1} className={classes.detailActionsSection}>
          <ActionMenu
            options={[
              {
                name: t("Edit"),
                onClick: () => {},
              },
              {
                name: d.substitute ? t("Remove Sub") : t("Assign Sub"),
                onClick: () => {},
              },
              {
                name: t("Delete"),
                onClick: () => {},
              },
            ]}
          />
        </Grid>
      </Grid>
    );
  });
};
