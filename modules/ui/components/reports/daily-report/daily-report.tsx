import * as React from "react";
import {
  Grid,
  makeStyles,
  Divider,
  Link,
  Button,
  Tooltip,
} from "@material-ui/core";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { useQueryParamIso } from "hooks/query-params";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetDailyReport } from "./graphql/get-daily-report.gen";
import { GetTotalContractedEmployeeCount } from "./graphql/get-total-employee-count.gen";
import { FilterQueryParams } from "./filters/filter-params";
import { Filters } from "./filters/index";
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
import { format } from "date-fns";
import { DailyReportSection } from "./daily-report-section";
import { SwapVacancyAssignments } from "./graphql/swap-subs.gen";

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
  const [selectedRows, setSelectedRows] = useState<Detail[]>([]);

  const [swapVacancyAssignments] = useMutationBundle(SwapVacancyAssignments, {
    onError: error => {
      console.log(error.graphQLErrors);
      // openSnackbar({
      //   message: error.graphQLErrors.map((e, i) => {
      //     const errorMessage =
      //       e.extensions?.data?.text ?? e.extensions?.data?.code;
      //     if (!errorMessage) {
      //       return null;
      //     }
      //     return <div key={i}>{errorMessage}</div>;
      //   }),
      //   dismissable: true,
      //   status: "error",
      // });
    },
  });

  // Keep date in filters in sync with date passed in from DateStepperHeader
  useEffect(() => {
    const dateString = format(props.date, "P");
    if (dateString !== filters.date) {
      updateFilters({ date: dateString });
    }
  }, [props.date]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear out all selected rows if the filters change or a card is selected
  useEffect(() => {
    setSelectedRows([]);
  }, [filters, selectedCard]);

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

  const updateSelectedDetails = (detail: Detail, add: boolean) => {
    if (add) {
      setSelectedRows([...selectedRows, detail]);
    } else {
      const filteredRows = selectedRows.filter(
        r => !(r.detailId === detail.detailId && r.type === detail.type)
      );
      setSelectedRows(filteredRows);
    }
  };

  const swapSubs = async () => {
    if (selectedRows.length !== 2) {
      return;
    }

    const firstDetail = selectedRows[0];
    const secondDetail = selectedRows[1];

    const result = await swapVacancyAssignments({
      variables: {
        swapDetails: {
          firstVacancyId: firstDetail.vacancyId
            ? Number(firstDetail.vacancyId)
            : 0,
          firstVacancyRowVersion: firstDetail.vacancyRowVersion ?? "",
          secondVacancyId: secondDetail.vacancyId
            ? Number(secondDetail.vacancyId)
            : 0,
          secondVacancyRowVersion: secondDetail.vacancyRowVersion ?? "",
        },
      },
    });

    if (result) {
      await getDailyReport.refetch();
      setSelectedRows([]);
    }
  };

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
      {displaySections(
        groupedDetails,
        selectedCard,
        classes,
        t,
        () => setSelectedCard(undefined),
        selectedRows,
        updateSelectedDetails,
        swapSubs
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
  action: {
    cursor: "pointer",
  },
}));

const displaySections = (
  groupedDetails: DetailGroup[],
  selectedCard?: CardType | undefined,
  classes: any,
  t: TFunction,
  clearSelectedCard: () => void,
  selectedRows: Detail[],
  updateSelectedDetails: (detail: Detail, add: boolean) => void,
  swapSubs: () => Promise<void>
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
          <Link className={classes.action} onClick={clearSelectedCard}>
            {t("Show all")}
          </Link>
        </div>
      )}
      {displaySwabSubsAction(selectedRows, swapSubs, t)}
      {groupedDetails.map((g, i) => {
        const hasDetails = !!(g.details && g.details.length);
        if (selectedCard && !hasDetails) {
          return null;
        }

        return (
          <div key={`group-${i}`} className={classes.detailGroup}>
            <DailyReportSection
              group={g}
              selectedDetails={selectedRows}
              updateSelectedDetails={updateSelectedDetails}
            />
          </div>
        );
      })}
    </div>
  );
};

const displaySwabSubsAction = (
  selectedRows: Detail[],
  swapSubs: () => Promise<void>,
  t: TFunction
) => {
  if (selectedRows.length < 2) {
    return;
  }

  const button = (
    <Button
      variant="outlined"
      color="primary"
      disabled={selectedRows.length > 2}
      onClick={swapSubs}
    >
      {t("Swap subs")}
    </Button>
  );

  if (selectedRows.length === 2) {
    return button;
  }

  // Button is wrapped in a span, because in this case the button will be disabled and Tooltip
  // needs its first descendant to be an active element
  return (
    <Tooltip
      title={t("Substitutes can only be swapped between 2 Absences")}
      placement="right"
    >
      <span>{button}</span>
    </Tooltip>
  );
};
