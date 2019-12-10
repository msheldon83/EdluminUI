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
  isValid,
} from "date-fns";
import { formatIsoDateIfPossible } from "helpers/date";
import {
  VacancyDetailCount,
  VacancyDetail,
  VacancyDetailVerifyInput,
} from "graphql/server-types.gen";
import { Assignment } from "./components/assignment";
import { useHistory } from "react-router";
import { usePayCodes } from "reference-data/pay-codes";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {
  showVerified: boolean;
  locationsFilter: number[];
  showLinkToVerify?: boolean;
  date?: Date;
  setDate?: (date: Date) => void;
  olderAction?: () => void;
};

export const VerifyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(VerifyRoute);
  const [selectedVacancyDetail, setSelectedVacancyDetail] = useState<
    string | undefined
  >(undefined);

  const today = useMemo(() => startOfToday(), []);
  /* Because this UI can stand alone or show up on the Admin homepage, we need
    to account for only controlling the selectedDate within here as well
    as the scenario where the selected date is provided to us through props.
    To handle that make sure to use "selectedDateToUse" when trying 
    to retrieve the currently selected date */
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

  const dateTabOptions: DateTabOption[] = useMemo(() => [], [assignmentCounts]);

  // If the date is controlled outside this component, track local state change
  // and call the provided setDate function in props
  useEffect(() => {
    if (props.setDate) {
      props.setDate(selectedDateTab);
    }
  }, [selectedDateTab]);

  // Determines what tabs are shown and the count of unverified assignments on each tab
  // We show today and each day of the last week unless weekends have 0
  // Older then shows a count of all unverified going back to the start of the school year
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
          onClick: props.olderAction,
        });
      } else {
        const dateToFind = format(date, "YYY-MM-dd");
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
    | "accountingCodeAllocations"
    | "verifyComments"
    | "verifiedAtLocal"
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
    }
    await getAssignmentCounts.refetch();
    await getVacancyDetails.refetch();
  };

  const uniqueDays = [...new Set(assignments.map(x => x.startDate))];

  return (
    <>
      <DateTabs
        selectedDateTab={selectedDateToUse}
        setSelectedDateTab={setSelectedDateTab}
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
          assignments.map((vacancyDetail, index) => (
            <Assignment
              key={vacancyDetail.id}
              vacancyDetail={vacancyDetail}
              shadeRow={index % 2 != 0}
              onVerify={onVerify}
              selectedVacancyDetail={selectedVacancyDetail}
              setSelectedVacancyDetail={setSelectedVacancyDetail}
              payCodeOptions={payCodeOptions}
            />
          ))
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
                {assignments
                  .filter(x => x.startDate === d)
                  .map((vacancyDetail, index) => (
                    <Assignment
                      key={vacancyDetail.id}
                      vacancyDetail={vacancyDetail}
                      shadeRow={index % 2 != 0}
                      onVerify={onVerify}
                      selectedVacancyDetail={selectedVacancyDetail}
                      setSelectedVacancyDetail={setSelectedVacancyDetail}
                      payCodeOptions={payCodeOptions}
                    />
                  ))}
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
