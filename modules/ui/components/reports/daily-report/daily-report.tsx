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
import { useState, useMemo, useEffect } from "react";
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
  CardType,
  DailyReportDetails,
  DetailGroup,
} from "./helpers";
import { GroupCard } from "./group-card";
import { TFunction } from "i18next";
import { ActionMenu } from "ui/components/action-menu";
import { format } from "date-fns";

type Props = {
  orgId: string;
  date: Date;
  setDate: (date: Date) => void;
  header: string;
  showFilters?: boolean;
  cards: CardType[];
};

export const DailyReport: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);
  const [selectedCard, setSelectedCard] = useState<CardType | undefined>();

  useEffect(() => {
    const dateString = format(props.date, "P");
    if (dateString !== filters.date) {
      updateFilters({ date: dateString });
    }
  }, [props.date]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <Filters orgId={props.orgId} setDate={props.setDate} />
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
    borderTop: "0 !important",
    margin: "0 !important",
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
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
  detailHeader: {
    color: theme.customColors.edluminSubText,
    background: theme.customColors.lightGray,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  detailEmployeeHeader: {
    paddingLeft: theme.spacing(5),
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
        if (g.details) {
          g.details = g.details.filter(d => d.state === selectedCard);
        }
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
        const hasDetails = !!(g.details && g.details.length);
        if (selectedCard && !hasDetails) {
          return null;
        }

        return (
          <div key={`group-${i}`} className={classes.detailGroup}>
            {getSectionDisplay(g, classes, t)}
          </div>
        );
      })}
    </div>
  );
};

const getSectionDisplay = (
  detailGroup: DetailGroup,
  classes: any,
  t: TFunction
) => {
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
                    {getDetailsDisplay(
                      s.details ?? [],
                      subGroupPanelId,
                      classes,
                      t
                    )}
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
  const detailsDisplay = details.map((d, i) => {
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
          {d.state === "noSubRequired" && (
            <div className={classes.detailSubText}>{t("Not required")}</div>
          )}
          {d.state !== "noSubRequired" && d.substitute && (
            <>
              <div>{d.substitute.name}</div>
              <div className={classes.detailSubText}>{d.substitute.phone}</div>
            </>
          )}
          {d.state !== "noSubRequired" && !d.substitute && (
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

  // Include a Header above all of the details
  return (
    <>
      <Grid
        item
        xs={12}
        container
        className={clsx({
          [classes.detail]: true,
          [classes.detailHeader]: true,
        })}
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
