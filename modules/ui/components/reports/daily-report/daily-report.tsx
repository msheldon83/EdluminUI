import {
  Button,
  Collapse,
  Divider,
  Grid,
  Link,
  makeStyles,
  Tooltip,
  Typography,
  IconButton,
} from "@material-ui/core";
import { format, isFuture, startOfToday } from "date-fns";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  DailyReportV2 as DailyReportType,
  PermissionEnum,
  FeatureFlag,
} from "graphql/server-types.gen";
import { not } from "helpers";
import { useIsMobile } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import { useDialog } from "hooks/use-dialog";
import { useSnackbar } from "hooks/use-snackbar";
import { TFunction } from "i18next";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  ShowErrors,
  ShowIgnoreAndContinueOrError,
} from "ui/components/error-helpers";
import { FilterListButton } from "ui/components/filter-list-button";
import { DesktopOnly } from "ui/components/mobile-helpers";
import { PrintPageButton } from "ui/components/print-page-button";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { VerifyOverviewUI } from "ui/pages/verify/overview-ui";
import { VerifyOverviewRoute } from "ui/routes/absence-vacancy/verify";
import { useRouteParams } from "ui/routes/definition";
import { DailyReportSection } from "./daily-report-section";
import { FilterQueryParams } from "./filters/filter-params";
import { Filters } from "./filters/index";
import { CancelAssignment } from "./graphql/cancel-assignment.gen";
import { GetDailyReportV2 } from "./graphql/get-daily-report-v2.gen";
import { GetTotalAwaitingVerificationCountForSchoolYear } from "./graphql/get-total-awaiting-verification-count-school-year.gen";
import { GetTotalContractedEmployeeCount } from "./graphql/get-total-employee-count.gen";
import { SwapVacancyAssignments } from "./graphql/swap-subs.gen";
import { GroupCard } from "./group-card";
import {
  CardType,
  Detail,
  DetailGroup,
  MapDailyReportDetails,
  filterDetailGroups,
} from "./helpers";
import { Can } from "ui/components/auth/can";
import { canAssignSub } from "helpers/permissions";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { ContentFooter } from "ui/components/content-footer";
import { DailyReportDetailUI } from "./detail-group/daily-report-detail-ui";
import { MobileDailyReportDetailUI } from "./detail-group/mobile-daily-report-detail-ui";
import CancelIcon from "@material-ui/icons/Cancel";

type Props = {
  orgId: string;
  date: Date;
  setDate: (date: Date) => void;
  header: string;
  showFilters?: boolean;
  cards: CardType[];
  selectedCard?: CardType;
  isHomePage?: boolean;
};

export const DailyReport: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openDialog } = useDialog();
  const { openSnackbar } = useSnackbar();
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);
  const [selectedCard, setSelectedCard] = useState<CardType | undefined>(
    props.selectedCard
  );
  const [selectedRows, setSelectedRows] = useState<Detail[]>([]);
  const verifyOverviewRouteParams = useRouteParams(VerifyOverviewRoute);

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

  // Make sure we change the selected card if the prop has changed
  useEffect(() => {
    if (selectedCard !== props.selectedCard) {
      setSelectedCard(props.selectedCard);
    }
  }, [props.selectedCard]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent future movement when on the Awaiting Verification card
  // with some explanation to the user as to why they can't go forward in time
  useEffect(() => {
    if (selectedCard === "awaitingVerification" && isFuture(props.date)) {
      openSnackbar({
        message: (
          <div>
            {t(
              "Future dates cannot be verified. We switched your view back to today."
            )}
          </div>
        ),
        dismissable: true,
        autoHideDuration: 5000,
        status: "info",
      });
      props.setDate(startOfToday());
    }
  }, [selectedCard, props.date]); // eslint-disable-line react-hooks/exhaustive-deps

  const serverQueryFilters = useMemo(() => filters, [filters]);
  const getDailyReport = useQueryBundle(GetDailyReportV2, {
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
  const getTotalAwaitingVerificationCount = useQueryBundle(
    GetTotalAwaitingVerificationCountForSchoolYear,
    {
      variables: {
        orgId: props.orgId,
      },
      skip: !props.cards.includes("awaitingVerification"),
    }
  );

  const dailyReportDetails = (getDailyReport.state === "LOADING" ||
  getDailyReport.state === "UPDATING"
    ? undefined
    : getDailyReport.data?.absence?.dailyReportV2) as DailyReportType;

  let allDetails: Detail[] = [];
  let groupedDetails: DetailGroup[] = [];

  if (dailyReportDetails) {
    const mappedDetails = MapDailyReportDetails(
      dailyReportDetails,
      props.orgId,
      new Date(filters.date),
      filters.showAbsences,
      filters.showVacancies,
      filters.groupDetailsBy,
      filters.subGroupDetailsBy,
      t
    );
    allDetails = mappedDetails.allDetails;
    groupedDetails = mappedDetails.groups;
  }

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
  const awaitingVerificationCount = useMemo(() => {
    if (
      !(
        getTotalAwaitingVerificationCount.state === "DONE" ||
        getTotalAwaitingVerificationCount.state === "UPDATING"
      )
    ) {
      return undefined;
    }

    const totalCount =
      getTotalAwaitingVerificationCount.data?.vacancy
        ?.getTotalCountOfAssignmentsToVerifyForCurrentSchoolYear;
    if (!totalCount) {
      return 0;
    }

    return Number(totalCount);
  }, [getTotalAwaitingVerificationCount]);

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

  const [swapVacancyAssignments] = useMutationBundle(SwapVacancyAssignments, {
    onError: error => {
      ShowIgnoreAndContinueOrError(
        error,
        openDialog,
        t("There was an issue swapping substitutes"),
        async () => await swapSubs(true),
        t
      );
    },
  });

  const [showingFilters, setShowingFilters] = useState(false);
  const toggleFilters = useCallback(() => setShowingFilters(not), [
    setShowingFilters,
  ]);

  const handleSwapSubs = async (detail: Detail) => {
    selectedRows.push(detail);
    await swapSubs(false);
  };

  const swapSubs = async (ignoreWarnings?: boolean) => {
    if (selectedRows.length !== 2) {
      return;
    }

    const firstDetail = selectedRows[0];
    const secondDetail = selectedRows[1];

    const result = await swapVacancyAssignments({
      variables: {
        swapDetails: {
          firstVacancyId: firstDetail.vacancyId ? firstDetail.vacancyId : "",
          firstVacancyRowVersion: firstDetail.vacancyRowVersion ?? "",
          secondVacancyId: secondDetail.vacancyId ? secondDetail.vacancyId : "",
          secondVacancyRowVersion: secondDetail.vacancyRowVersion ?? "",
          ignoreWarnings: ignoreWarnings ?? false,
        },
      },
    });

    if (result) {
      await getDailyReport.refetch();
      setSelectedRows([]);
    } else {
      selectedRows.pop();
      setSelectedRows(selectedRows);
    }
  };

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const removeSub = async (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => {
    const result = await cancelAssignment({
      variables: {
        cancelRequest: {
          assignmentId: assignmentId ?? "",
          rowVersion: assignmentRowVersion ?? "",
        },
      },
    });
    if (result) {
      await getDailyReport.refetch();
    }
  };

  return (
    <>
      <Section className={classes.dailyReportContainer}>
        <div
          className={
            isMobile ? classes.mobileHeadercontainer : classes.headerContainer
          }
        >
          <Grid container>
            <Grid item xs={6} md={12}>
              <SectionHeader title={props.header} className={classes.header} />
            </Grid>
            {props.showFilters && (
              <>
                {isMobile && (
                  <Grid item xs={6} md={12} className={classes.noPrint}>
                    <FilterListButton onClick={toggleFilters} />
                  </Grid>
                )}
                <Grid item xs={12}>
                  {isMobile ? (
                    <>
                      <Collapse in={showingFilters}>
                        <Filters orgId={props.orgId} setDate={props.setDate} />
                        <Divider />
                      </Collapse>
                    </>
                  ) : (
                    <>
                      <Filters orgId={props.orgId} setDate={props.setDate} />
                      <Divider />
                    </>
                  )}
                </Grid>
              </>
            )}
          </Grid>
          <Grid
            container
            spacing={isMobile ? 2 : 2}
            justify="flex-start"
            className={classes.cardContainer}
          >
            {props.cards.map((c, i) => {
              let countOverride = undefined;
              let totalOverride = undefined;

              if (c === "total") {
                totalOverride = totalContractedEmployeeCount ?? 0;
              } else if (c === "awaitingVerification") {
                countOverride = awaitingVerificationCount ?? 0;
                totalOverride = awaitingVerificationCount ?? 0;
              }

              return c === "awaitingVerification" ? (
                <Can do={[PermissionEnum.AbsVacVerify]} key={i}>
                  <Grid item xs={isMobile ? 6 : undefined}>
                    <GroupCard
                      cardType={c}
                      details={allDetails}
                      countOverride={countOverride}
                      totalOverride={totalOverride}
                      onClick={(c: CardType) => {
                        setSelectedCard(c === "total" ? undefined : c);
                      }}
                      activeCard={selectedCard}
                      showPercentInLabel={c !== "awaitingVerification"}
                      showFractionCount={false}
                    />
                  </Grid>
                </Can>
              ) : (
                <Grid item key={i} xs={isMobile ? 6 : undefined}>
                  <GroupCard
                    cardType={c}
                    details={allDetails}
                    countOverride={countOverride}
                    totalOverride={totalOverride}
                    onClick={(c: CardType) => {
                      setSelectedCard(c === "total" ? undefined : c);
                    }}
                    activeCard={selectedCard}
                    showPercentInLabel={true}
                    showFractionCount={props.isHomePage && c === "unfilled"}
                  />
                </Grid>
              );
            })}
          </Grid>
        </div>
        {displaySections(
          groupedDetails,
          selectedCard,
          classes,
          t,
          () => setSelectedCard(undefined),
          selectedRows,
          updateSelectedDetails,
          swapSubs,
          removeSub,
          props.date,
          props.setDate,
          () => {
            const url = VerifyOverviewRoute.generate(verifyOverviewRouteParams);
            history.push(url, {
              selectedDateTab: "older",
            });
          },
          props.orgId,
          async () => {
            await getTotalAwaitingVerificationCount.refetch();
          },
          handleSwapSubs
        )}
      </Section>
      {selectedRows.length > 0 && (
        <ContentFooter>
          <Grid
            container
            className={
              isMobile
                ? classes.swapSubContainerMobile
                : classes.swapSubContainer
            }
          >
            <Grid item container xs={12}>
              <Grid xs={11} item>
                <Typography variant="h6">
                  {t("Select another absence or vacancy to swap subs")}
                </Typography>
              </Grid>
              <Grid xs={1} className={classes.swapCloseContainer} item>
                <IconButton
                  className={classes.swapCloseButton}
                  key="close"
                  aria-label="close"
                  color="inherit"
                  onClick={() => {
                    setSelectedRows([]);
                  }}
                >
                  <CancelIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              {isMobile ? (
                <MobileDailyReportDetailUI
                  detail={selectedRows[0]}
                  selectedDetails={selectedRows}
                  removeSub={removeSub}
                  rowActions={[]}
                  highlighted={true}
                  showDetails={true}
                />
              ) : (
                <DailyReportDetailUI
                  detail={selectedRows[0]}
                  selectedDetails={selectedRows}
                  removeSub={removeSub}
                  rowActions={[]}
                  highlighted={true}
                />
              )}
            </Grid>
          </Grid>
        </ContentFooter>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  dailyReportContainer: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    "@media print": {
      padding: 0,
    },
  },
  headerContainer: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  mobileHeadercontainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  header: {
    "@media print": {
      display: "none",
    },
  },
  cardContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    "@media print": {
      display: "none",
    },
  },
  detailActions: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    "@media print": {
      display: "none",
    },
  },
  groupedDetailsContainer: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
  },
  detailGroup: {
    marginTop: theme.spacing(2),
    "@media print": {
      marginTop: 0,
    },
  },
  verifyContainer: {
    marginTop: theme.spacing(2),
  },
  action: {
    cursor: "pointer",
  },
  noPrint: {
    "@media print": { display: "none" },
  },
  buttonHover: {
    "&:hover": {
      backgroundColor: "#def0ff",
      color: "#2196F3",
    },
  },
  swapSubContainer: {
    backgroundColor: theme.customColors.darkBlueGray,
    paddingTop: theme.typography.pxToRem(15),
    paddingLeft: theme.typography.pxToRem(40),
    paddingRight: theme.typography.pxToRem(43),
    color: theme.customColors.white,
    width: "100%",
  },
  swapSubContainerMobile: {
    backgroundColor: theme.customColors.darkBlueGray,
    paddingTop: theme.typography.pxToRem(15),
    paddingLeft: theme.typography.pxToRem(40),
    paddingRight: theme.typography.pxToRem(43),
    color: theme.customColors.white,
    width: "117%",
    marginLeft: theme.typography.pxToRem(-53),
  },
  swapCloseButton: {
    paddingTop: 0,
  },
  swapCloseContainer: {
    textAlign: "right",
  },
}));

const displaySections = (
  groupedDetails: DetailGroup[],
  selectedCard: CardType | undefined,
  classes: any,
  t: TFunction,
  clearSelectedCard: () => void,
  selectedRows: Detail[],
  updateSelectedDetails: (detail: Detail, add: boolean) => void,
  swapSubs: (ignoreWarnings?: boolean) => Promise<void>,
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>,
  date: Date,
  setDate: (date: Date) => void,
  verifyOlderAction: () => void,
  orgId: string,
  updateVerificationCount: () => Promise<void>,
  handleSwapSubs: (detail: Detail) => Promise<void>
) => {
  // If there is a selected card, go through each group and filter all of their data to match
  if (selectedCard) {
    filterDetailGroups(groupedDetails, d => d.state === selectedCard);
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
    case "awaitingVerification":
      selectedCardDisplayText = t("Showing only Awaiting verification.");
      break;
  }

  // Build a display section for each group
  return (
    <div>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        className={classes.detailActions}
      >
        {selectedCard && (
          <Grid item>
            {selectedCardDisplayText}{" "}
            <Link className={classes.action} onClick={clearSelectedCard}>
              {t("Show all")}
            </Link>
          </Grid>
        )}
        <Grid item>
          {displaySwabSubsAction(
            selectedRows,
            swapSubs,
            t,
            orgId,
            classes,
            date
          )}
        </Grid>
        <DesktopOnly>
          <Grid item>
            <PrintPageButton />
          </Grid>
        </DesktopOnly>
      </Grid>
      {selectedCard === "awaitingVerification" ? (
        <div className={classes.verifyContainer}>
          <VerifyOverviewUI
            showVerified={false}
            locationsFilter={[]}
            showLinkToVerify={true}
            date={date}
            setDate={setDate}
            olderAction={verifyOlderAction}
            onUpdateCount={updateVerificationCount}
          />
        </div>
      ) : (
        <div className={classes.groupedDetailsContainer}>
          {groupedDetails.map((g, i) => {
            const hasNoDetails = !(g.details && g.details.length);
            if (selectedCard && hasNoDetails) {
              return null;
            }

            return (
              <div key={`group-${i}`} className={classes.detailGroup}>
                <DailyReportSection
                  group={g}
                  selectedDetails={selectedRows}
                  updateSelectedDetails={updateSelectedDetails}
                  removeSub={removeSub}
                  vacancyDate={format(date, "MMM d")}
                  swapSubs={handleSwapSubs}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const displaySwabSubsAction = (
  selectedRows: Detail[],
  swapSubs: (ignoreWarnings?: boolean) => Promise<void>,
  t: TFunction,
  orgId: string,
  classes: any,
  absDate: Date
) => {
  if (selectedRows.length < 2) {
    return;
  }

  const button = (
    <Button
      variant="outlined"
      color="primary"
      className={classes.buttonHover}
      disabled={selectedRows.length > 2}
      onClick={async () => await swapSubs(false)}
    >
      {t("Swap subs")}
    </Button>
  );

  if (selectedRows.length === 2) {
    return (
      <Can
        do={(
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string,
          forRole?: Role | null | undefined
        ) => canAssignSub(absDate, permissions, isSysAdmin, orgId, forRole)}
      >
        {button}
      </Can>
    );
  }

  // Button is wrapped in a span, because in this case the button will be disabled and Tooltip
  // needs its first descendant to be an active element
  return (
    <Can
      do={(
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string,
        forRole?: Role | null | undefined
      ) => canAssignSub(absDate, permissions, isSysAdmin, orgId, forRole)}
    >
      <Tooltip
        title={t("Substitutes can only be swapped between 2 Absences")}
        placement="right"
      >
        <span>{button}</span>
      </Tooltip>
    </Can>
  );
};
