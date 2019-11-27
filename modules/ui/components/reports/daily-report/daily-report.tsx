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
  Button,
} from "@material-ui/core";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQueryParamIso } from "hooks/query-params";
import { useQueryBundle } from "graphql/hooks";
import { GetDailyReport } from "./graphql/get-daily-report.gen";
import { FilterQueryParams } from "./filters/filter-params";
import { Filters } from "./filters/index";
import { FilterList, ExpandMore, MoreVert } from "@material-ui/icons";
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
} from "./helpers";
import { GroupCard } from "./group-card";
import { TFunction } from "i18next";

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

  const getDailyReport = useQueryBundle(GetDailyReport, {
    variables: {
      ...filters,
      orgId: props.orgId,
    },
  });

  const dailyReportDetails = (getDailyReport.state === "LOADING" ||
  getDailyReport.state === "UPDATING"
    ? undefined
    : getDailyReport.data?.absence?.dailyReport) as DailyReportType;

  let details: Detail[] = [];

  if (dailyReportDetails) {
    details = MapDailyReportDetails(dailyReportDetails, new Date(filters.date));
  }

  const totalCount = dailyReportDetails?.totalCount ?? 0;

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
                details={details}
                onClick={(c: CardType) => {
                  setSelectedCard(c === "total" ? undefined : c);
                }}
              />
            </Grid>
          );
        })}
      </Grid>
      {displaySections(details, selectedCard, classes, t, () =>
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
  details: {
    padding: 0,
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
  details: Detail[],
  selectedCard?: CardType | undefined,
  classes: any,
  t: TFunction,
  clearSelection: () => void
) => {
  if (selectedCard === "unfilled") {
    return (
      <div>
        <div>
          {t("Showing only Unfilled absences.")}{" "}
          <Link className={classes.action} onClick={clearSelection}>
            {t("Show all")}
          </Link>
        </div>
        {getSectionDisplay(
          GetUnfilled(details),
          t("Unfilled"),
          "unfilled",
          classes,
          t
        )}
      </div>
    );
  }

  if (selectedCard === "filled") {
    return (
      <div>
        <div>
          {t("Showing only Filled absences.")}{" "}
          <Link className={classes.action} onClick={clearSelection}>
            {t("Show all")}
          </Link>
        </div>
        {getSectionDisplay(
          GetFilled(details),
          t("Filled"),
          "filled",
          classes,
          t
        )}
      </div>
    );
  }

  if (selectedCard === "noSubRequired") {
    return (
      <div>
        <div>
          {t("Showing only No sub required absences.")}{" "}
          <Link className={classes.action} onClick={clearSelection}>
            {t("Show all")}
          </Link>
        </div>
        {getSectionDisplay(
          GetNoSubRequired(details),
          t("No sub required"),
          "noSubRequired",
          classes,
          t
        )}
      </div>
    );
  }

  return (
    <div>
      {getSectionDisplay(
        GetUnfilled(details),
        t("Unfilled"),
        "unfilled",
        classes,
        t
      )}
      {getSectionDisplay(GetFilled(details), t("Filled"), "filled", classes, t)}
      {getSectionDisplay(
        GetNoSubRequired(details),
        t("No sub required"),
        "noSubRequired",
        classes,
        t
      )}
    </div>
  );
};

const getSectionDisplay = (
  details: Detail[],
  labelText: string,
  panelId: string,
  classes: any,
  t: TFunction
) => {
  const headerText = `${labelText} (${details.length})`;
  const hasDetails = !!details.length;

  return (
    <ExpansionPanel
      className={classes.detailGroup}
      defaultExpanded={hasDetails}
    >
      <ExpansionPanelSummary
        expandIcon={<ExpandMore />}
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
      {hasDetails && (
        <ExpansionPanelDetails className={classes.details}>
          <Grid container alignItems="flex-start">
            {details.map((d, i) => {
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
                        <div className={classes.detailSubText}>
                          {d.substitute.phone}
                        </div>
                      </>
                    ) : (
                      <Link className={classes.action}>{t("Assign")}</Link>
                    )}
                  </Grid>
                  <Grid item xs={1}>
                    <div>{d.type === "absence" ? `#${d.id}` : `#V${d.id}`}</div>
                    {d.assignmentId && (
                      <div
                        className={classes.detailSubText}
                      >{`#C${d.assignmentId}`}</div>
                    )}
                  </Grid>
                  <Grid item xs={1} className={classes.detailActionsSection}>
                    <MoreVert className={classes.action} />
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </ExpansionPanelDetails>
      )}
    </ExpansionPanel>
  );
};
