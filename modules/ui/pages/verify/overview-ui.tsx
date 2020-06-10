import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { makeStyles } from "@material-ui/styles";
import {
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { useState, useMemo, useEffect } from "react";
import { DateTabs, DateTabOption } from "./components/tabs";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { VerifyRoute } from "ui/routes/absence-vacancy/verify";
import { GetAssignmentCount } from "./graphql/get-assignment-count.gen";
import { GetVacancyDetails } from "./graphql/get-vacancydetails.gen";
import { VerifyVacancyDetail } from "./graphql/verify-vacancy-detail.gen";
import {
  isToday,
  addDays,
  isWeekend,
  format,
  isEqual,
  startOfToday,
  isBefore,
} from "date-fns";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { formatIsoDateIfPossible } from "helpers/date";
import {
  VacancyDetailCount,
  VacancyDetail,
  VacancyDetailVerifyInput,
  Maybe,
} from "graphql/server-types.gen";
import { Assignment } from "./components/assignment";
import { useHistory } from "react-router";
import { usePayCodes } from "reference-data/pay-codes";
import { useSnackbar } from "hooks/use-snackbar";
import { useOrgVacancyDayConversions } from "reference-data/org-vacancy-day-conversions";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { DayRow } from "./types";
import { ProgressBar } from "./components/progess-bar";

const OverviewTableHead: React.FC<{}> = () => {
  const { t } = useTranslation();
  const classes = useHeadStyles();

  return (
    <TableHead className={classes.header}>
      <TableCell />
      <TableCell />
      <TableCell align="center">{t("Total")}</TableCell>
      <TableCell align="center">{t("Verified")}</TableCell>
      <TableCell align="center">{t("Pending")}</TableCell>
    </TableHead>
  );
};

const useHeadStyles = makeStyles(theme => ({
  header: {
    borderTop: `1px solid ${theme.customColors.sectionBorder}`,
    cursor: "pointer",
    background: theme.customColors.lightGray,
  },
}));

type RowProps = DayRow & { goToDate: (date: Date) => void };

const OverviewTableRow: React.FC<RowProps> = ({
  date,
  verifiedAssignments,
  totalAssignments,
  goToDate,
}) => {
  const classes = useRowStyles();
  return (
    <TableRow className={classes.tableRow} onClick={() => goToDate(date)}>
      <TableCell>{format(date, "EEE, MMM d")}</TableCell>
      <TableCell size="medium" align="center">
        <ProgressBar
          verifiedAssignments={verifiedAssignments}
          totalAssignments={totalAssignments}
        />
      </TableCell>
      <TableCell align="center">{totalAssignments}</TableCell>
      <TableCell align="center">{verifiedAssignments}</TableCell>
      <TableCell align="center">
        {totalAssignments - verifiedAssignments}
      </TableCell>
    </TableRow>
  );
};

const useRowStyles = makeStyles(theme => ({
  tableRow: {
    borderTop: `1px solid ${theme.customColors.sectionBorder}`,
    cursor: "pointer",

    "&:nth-child(even)": {
      background: theme.customColors.lightGray,
    },

    "&:hover": {
      background: theme.customColors.lightGray,
    },
  },
}));

type Props = {
  dates: DayRow[];
  goToDate: (date: Date) => void;
};

export const VerifyOverviewUI: React.FC<Props> = ({ dates, goToDate }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  if (dates.length == 0)
    return (
      <Typography>
        {t("There are no assignments in the given range.")}
      </Typography>
    );

  const sortedDates = dates.sort((d1, d2) =>
    isBefore(d1.date, d2.date) ? -1 : 1
  );

  return (
    <Table className={classes.table}>
      <colgroup>
        <col className={classes.date} />
        <col className={classes.progress} />
        <col />
        <col />
        <col />
      </colgroup>
      <OverviewTableHead />
      <TableBody>
        {dates.map((d, i) => (
          <OverviewTableRow key={i} {...d} goToDate={goToDate} />
        ))}
      </TableBody>
    </Table>
  );
};

const useStyles = makeStyles(theme => ({
  table: {
    tableLayout: "fixed",
  },
  date: {
    width: "15%",
  },
  progress: {
    width: "60%",
  },
}));

/*export const VerifyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const vacancyDetailAnimationClasses = useVacancyDetailAnimationStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(VerifyRoute);
  const [selectedVacancyDetail, setSelectedVacancyDetail] = useState<
    string | undefined
  >(undefined);
  const [nextSelectedVacancyDetail, setNextSelectedVacancyDetail] = useState<
    string | undefined
  >(undefined);
  const [verifiedId, setVerifiedId] = useState<string | null | undefined>(null);
  const vacancyDayConversions = useOrgVacancyDayConversions(
    params.organizationId
  );
  const absenceEditParams = useRouteParams(AdminEditAbsenceRoute);
  const vacancyEditParams = useRouteParams(VacancyViewRoute);

  const today = useMemo(() => startOfToday(), []);
  /* Because this UI can stand alone or show up on the Admin homepage, we need
    to account for only controlling the selectedDate within here as well
    as the scenario where the selected date is provided to us through props.
    To handle that make sure to use "selectedDateToUse" when trying
    to retrieve the currently selected date * /
  const [selectedDateTab, setSelectedDateTab] = useState<Date>(
    props.date ?? today
  );
  let selectedDateToUse = props.date ? props.date : selectedDateTab;

  const getAssignmentCounts = useQueryBundle(GetAssignmentCount, {
    variables: {
      orgId: params.organizationId,
      locationIds: props.locationsFilter,
    },
  });

  const assignmentCounts = (getAssignmentCounts.state === "LOADING"
    ? []
    : getAssignmentCounts.data?.vacancy?.getCountOfAssignmentsForVerify ??
      []) as VacancyDetailCount[];

  const dateTabOptions: DateTabOption[] = useMemo(() => {
    const a = assignmentCounts; // Need this here to make our linter happy
    return [];
  }, [assignmentCounts]);

  const setDate = props.setDate;
  const olderAction = props.olderAction;

  // If the date is controlled outside this component, track local state change
  // and call the provided setDate function in props
  useEffect(() => {
    if (setDate) {
      setDate(selectedDateTab);
    }
  }, [setDate, selectedDateTab]);

  // Determines what tabs are shown and the count of unverified assignments on each tab
  // We show today and each day of the last week unless weekends have 0
  // Older then shows a count of all unverified going back to the start of the school year
  // Be careful with the dependencies on this hook.  We don't want anything to push more than 8 items onto the array
  useEffect(() => {
    let date = today;
    let totalCount = assignmentCounts
      .map(x => x.count)
      .reduce((prev: number, curr: number) => prev + curr, 0);

    for (let i = 0; i < 9; i++) {
      let count = 0;
      if (i === 8) {
        dateTabOptions.push({
          date: date,
          dateLabel: t("Older"),
          count: totalCount,
          onClick: olderAction,
        });
      } else {
        const dateToFind = format(date, "yyyy-MM-dd");
        const index = assignmentCounts.findIndex(x => x.date === dateToFind);
        if (index != -1) {
          count = assignmentCounts[index].count;
          totalCount = totalCount - count;
        }
        if (isToday(date)) {
          dateTabOptions.push({
            date: date,
            dateLabel: t("Today"),
            count: count,
          });
        } else if (!isWeekend(date) || count !== 0) {
          dateTabOptions.push({
            date: date,
            dateLabel: format(date, "EEE, MMM d"),
            count: count,
          });
        }
        date = addDays(date, -1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentCounts, today, dateTabOptions, t]);

  // If we're given a date we don't actually have in our list of
  // tabs, keep the focus to Today
  if (!dateTabOptions.find(d => isEqual(d.date, selectedDateToUse))) {
    selectedDateToUse = today;
  }

  // Check to see if we've been provided a default tab date to start with
  if (history.location.state?.selectedDateTab && !!dateTabOptions.length) {
    if (history.location.state?.selectedDateTab === "older") {
      selectedDateToUse = dateTabOptions[dateTabOptions.length - 1].date;
    } else {
      const providedDate = new Date(history.location.state?.selectedDateTab);
      const tabOptionMatch = dateTabOptions.find(d =>
        isEqual(d.date, providedDate)
      );
      if (tabOptionMatch) {
        selectedDateToUse = tabOptionMatch.date;
      }
    }
  }

  const getVacancyDetails = useQueryBundle(GetVacancyDetails, {
    variables: {
      orgId: params.organizationId,
      includeVerified: props.showVerified,
      locationIds: props.locationsFilter,
      fromDate: isEqual(selectedDateToUse, addDays(today, -8))
        ? null
        : selectedDateToUse,
      toDate: selectedDateToUse,
      shadowFromOrgId:
        props.subSourceFilter && props.subSourceFilter.length > 0
          ? props.subSourceFilter
          : undefined,
    },
  });

  const assignments = (getVacancyDetails.state === "LOADING"
    ? []
    : getVacancyDetails.data?.vacancy?.getAssignmentsForVerify ?? []) as Pick<
    VacancyDetail,
    | "id"
    | "orgId"
    | "startTimeLocal"
    | "startDate"
    | "endTimeLocal"
    | "assignment"
    | "payCode"
    | "location"
    | "vacancy"
    | "dayPortion"
    | "totalDayPortion"
    | "accountingCodeAllocations"
    | "verifyComments"
    | "verifiedAtLocal"
    | "payDurationOverride"
    | "actualDuration"
    | "payInfo"
    | "vacancyReason"
  >[];

  const payCodes = usePayCodes(params.organizationId);
  const payCodeOptions = useMemo(
    () => payCodes.map(c => ({ label: c.name, value: c.id })),
    [payCodes]
  );

  const [verifyVacancyDetail] = useMutationBundle(VerifyVacancyDetail);
  const onVerify = async (verifyInput: VacancyDetailVerifyInput) => {
    await verifyVacancyDetail({
      variables: {
        vacancyDetail: verifyInput,
      },
    });
    if (verifyInput.doVerify) {
      setVerifiedId(verifyInput.vacancyDetailId);
      openSnackbar({
        dismissable: true,
        autoHideDuration: 5000,
        status: "info",
        message: (
          <div>
            {t("Assignment has been verified.")}
            <Button
              variant="contained"
              onClick={() =>
                onVerify({
                  vacancyDetailId: verifyInput.vacancyDetailId,
                  doVerify: false,
                })
              }
            >
              {t("Undo verify")}
            </Button>
          </div>
        ),
      });
      setSelectedVacancyDetail(nextSelectedVacancyDetail);
    }
    if (verifyInput.doVerify !== null) {
      await getAssignmentCounts.refetch();
      await getVacancyDetails.refetch();
      setVerifiedId(null);
      if (props.onUpdateCount) {
        await props.onUpdateCount();
      }
    }
  };

  const uniqueDays = [...new Set(assignments.map(x => x.startDate))];

  // When we select a detail record figure out what the next record we should have selected once we verify
  const onSelectDetail = (vacancyDetailId: string) => {
    setSelectedVacancyDetail(vacancyDetailId);
    const index = assignments.findIndex(x => x.id === vacancyDetailId);
    const nextId = assignments[index + 1]?.id;
    const previousId = assignments[index - 1]?.id;
    if (nextId) {
      setNextSelectedVacancyDetail(nextId);
    } else if (previousId) {
      setNextSelectedVacancyDetail(previousId);
    } else {
      setNextSelectedVacancyDetail(undefined);
    }
  };

  const handleSetSelectedDate = (d: Date) => {
    setSelectedDateTab(d);
    setSelectedVacancyDetail(undefined);
    setNextSelectedVacancyDetail(undefined);
  };

  const goToEdit = (vacancyId: string, absenceId?: string | null) => {
    if (absenceId) {
      const url = AdminEditAbsenceRoute.generate({
          ...absenceEditParams,
          absenceId}
      );
      history.push(url);
    } else {
      const url = VacancyViewRoute.generate({
          ...vacancyEditParams,
          vacancyId}
      );
      history.push(url);
    }
  };

  return (
    <>
      <DateTabs
        selectedDateTab={selectedDateToUse}
        setSelectedDateTab={handleSetSelectedDate}
        dateTabOptions={dateTabOptions}
        showLinkToVerify={props.showLinkToVerify}
      />
      <Section>
        {getVacancyDetails.state === "LOADING" ? (
          <Typography variant="h5">
            {t("Loading substitute assignments")}
          </Typography>
        ) : assignments.length === 0 ? (
          <Typography variant="h5">{t("All assignments verified")}</Typography>
        ) : uniqueDays.length === 1 ? (
          <TransitionGroup>
            {assignments.map((vacancyDetail, index) => (
              <CSSTransition
                key={vacancyDetail.id}
                timeout={ANIMATION_TIMEOUT}
                classNames={{
                  enter: vacancyDetailAnimationClasses.enter,
                  enterActive: vacancyDetailAnimationClasses.enterActive,
                  exit: vacancyDetailAnimationClasses.exit,
                  exitActive: vacancyDetailAnimationClasses.exitActive,
                }}
              >
                <div>
                  <Collapse
                    in={verifiedId !== vacancyDetail.id}
                    key={vacancyDetail.id}
                  >
                    <Assignment
                      key={vacancyDetail.id}
                      vacancyDetail={vacancyDetail}
                      shadeRow={index % 2 != 0}
                      onVerify={onVerify}
                      selectedVacancyDetail={selectedVacancyDetail}
                      onSelectDetail={onSelectDetail}
                      payCodeOptions={payCodeOptions}
                      vacancyDayConversions={vacancyDayConversions}
                      goToEdit={goToEdit}
                    />
                  </Collapse>
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>
        ) : (
          uniqueDays.map((d, i) => (
            <ExpansionPanel defaultExpanded={true} key={`panel-${i}`}>
              <ExpansionPanelSummary
                key={`summary-${i}`}
                expandIcon={<ExpandMore />}
                aria-controls={`content-${i}`}
                id={`summaryid-${i}`}
                className={classes.summary}
              >
                <div className={classes.subGroupSummaryText}>
                  {formatIsoDateIfPossible(d, "EEE MMM, d")}
                </div>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.details}>
                <TransitionGroup>
                  {assignments
                    .filter(x => x.startDate === d)
                    .map((vacancyDetail, index) => (
                      <CSSTransition
                        key={vacancyDetail.id}
                        timeout={ANIMATION_TIMEOUT}
                        classNames={{
                          enter: vacancyDetailAnimationClasses.enter,
                          enterActive:
                            vacancyDetailAnimationClasses.enterActive,
                          exit: vacancyDetailAnimationClasses.exit,
                          exitActive: vacancyDetailAnimationClasses.exitActive,
                        }}
                      >
                        <div>
                          <Collapse
                            in={verifiedId !== vacancyDetail.id}
                            key={vacancyDetail.id}
                          >
                            <Assignment
                              key={vacancyDetail.id}
                              vacancyDetail={vacancyDetail}
                              shadeRow={index % 2 != 0}
                              onVerify={onVerify}
                              selectedVacancyDetail={selectedVacancyDetail}
                              onSelectDetail={onSelectDetail}
                              payCodeOptions={payCodeOptions}
                              vacancyDayConversions={vacancyDayConversions}
                              goToEdit={goToEdit}
                            />
                          </Collapse>
                        </div>
                      </CSSTransition>
                    ))}
                </TransitionGroup>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))
        )}
      </Section>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
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
}));

const ANIMATION_TIMEOUT = 500;

const useVacancyDetailAnimationStyles = makeStyles(theme => ({
  enter: {
    maxHeight: 0,
    opacity: 0,
    overflow: "hidden",
  },
  enterActive: {
    maxHeight: theme.typography.pxToRem(300),
    opacity: 1,
    overflow: "hidden",
    transition: `all ${ANIMATION_TIMEOUT}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  },
  exit: {
    maxHeight: theme.typography.pxToRem(300),
    opacity: 1,
    overflow: "hidden",
  },
  exitActive: {
    maxHeight: 0,
    opacity: 0,
    overflow: "hidden",
    transition: `all ${ANIMATION_TIMEOUT}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  },
}));*/
