import * as React from "react";
import {
  Grid,
  makeStyles,
  Typography,
  Button,
  Paper,
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
import { useState } from "react";
import { useQueryParamIso } from "hooks/query-params";
import { useQueryBundle } from "graphql/hooks";
import { GetDailyReport } from "./graphql/get-daily-report.gen";
import { FilterQueryParams } from "./filters/filter-params";
import { Filters } from "./filters/index";
import { FilterList, ExpandMore, MoreVert } from "@material-ui/icons";
import { Section } from "ui/components/section";
import {
  DailyReport as DailyReportType,
  AbsenceDetail,
  VacancyDetail,
} from "graphql/server-types.gen";
import { format, isEqual, parseISO } from "date-fns";
import { flatMap } from "lodash-es";
import { SectionHeader } from "ui/components/section-header";
import { TFunction } from "i18next";
import clsx from "clsx";

type Props = {
  orgId: string;
};

export const DailyReport: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [filters] = useQueryParamIso(FilterQueryParams);

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
  let unfilled: Detail[] = [];
  let filled: Detail[] = [];
  let noSubRequired: Detail[] = [];

  if (dailyReportDetails) {
    details = mapDailyReportDetails(dailyReportDetails, new Date(filters.date));
    unfilled = getUnfilled(details);
    filled = getFilled(details);
    noSubRequired = getNoSubRequired(details);
  }

  const totalCount = dailyReportDetails?.totalCount ?? 0;

  return (
    <Section>
      <SectionHeader title={t("Filter absences")} />
      <Filters orgId={props.orgId} />
      <Divider />
      {/* CARDS */}
      {getSectionDisplay(unfilled, t("Unfilled"), "unfilled", classes, t)}
      {getSectionDisplay(filled, t("Filled"), "filled", classes, t)}
      {getSectionDisplay(
        noSubRequired,
        t("No sub required"),
        "noSubRequired",
        classes,
        t
      )}
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
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
    color: "#9E9E9E",
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

  absenceDetailsSection: {
    marginTop: theme.spacing(),
  },
  substituteDetailsSection: {
    marginTop: theme.spacing(2),
  },
  vacancyDetails: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  absenceReasonDetails: {
    fontWeight: "bold",
  },
  dates: {
    marginTop: theme.spacing(2),
  },
  notesToApproverSection: {
    marginTop: theme.spacing(2),
  },
  notesForApprover: {
    marginTop: theme.spacing(),
    paddingRight: theme.spacing(6),
  },
  requiresSubSection: {
    marginBottom: theme.spacing(2),
  },
  preArrangedChip: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  notesForSubSection: {
    marginTop: theme.spacing(4),
  },
  notesForSub: {
    marginTop: theme.spacing(),
  },
  subText: {
    color: theme.customColors.darkGray,
  },
  edit: {
    marginTop: theme.spacing(4),
  },
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));

type Detail = {
  id: string;
  state: "unfilled" | "filled" | "noSubRequired";
  type: "absence" | "vacancy";
  employee?: {
    id: string;
    name: string;
  };
  absenceReason?: string;
  date: Date;
  dateRange: string;
  startTime: string;
  endTime: string;
  created: Date;
  substitute?: {
    id: string;
    name: string;
    phone: string;
  };
  position?: {
    id: string;
    name: string;
  };
};

const mapDailyReportDetails = (
  dailyReport: DailyReportType,
  date: Date
): Detail[] => {
  const details: Detail[] = [];

  // Filled Absences
  const filledAbsencesDetails = flatMap(dailyReport.filledAbsences, a => {
    if (!a || !a.details) {
      return [];
    }

    return a.details.map(d => {
      const absenceDetail = d as AbsenceDetail;
      return {
        id: a.id,
        state: "filled",
        type: "absence",
        employee: a.employee
          ? {
              id: a.employee.id,
              name: `${a.employee.firstName} ${a.employee.lastName}`,
            }
          : undefined,
        absenceReason: absenceDetail.reasonUsages![0]?.absenceReason?.name,
        date: parseISO(absenceDetail.startDate),
        dateRange: getRangeDisplayText(
          absenceDetail.startDate,
          absenceDetail.endDate
        ),
        startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
        created: a.createdUtc,
      } as Detail;
    });
  });
  // Add in getting the Sub for the appropriate Absence Detail > Vacancy Detail match
  details.push(...filledAbsencesDetails);

  // Filled Vacancies
  const filledVacancyDetails = flatMap(dailyReport.filledVacancies, v => {
    if (!v || !v.details) {
      return [];
    }

    return v.details.map(d => {
      const vacancyDetail = d as VacancyDetail;
      return {
        id: v.id,
        state: "filled",
        type: "vacancy",
        date: parseISO(vacancyDetail.startDate),
        dateRange: getRangeDisplayText(
          vacancyDetail.startDate,
          vacancyDetail.endDate
        ),
        startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
        created: v.createdUtc,
        substitute:
          vacancyDetail.assignment && vacancyDetail.assignment.employee
            ? {
                id: vacancyDetail.assignment.employee.id,
                name: `${vacancyDetail.assignment.employee.firstName} ${vacancyDetail.assignment.employee.lastName}`,
                phone: vacancyDetail.assignment.employee.phoneNumber,
              }
            : undefined,
      } as Detail;
    });
  });
  details.push(...filledVacancyDetails);

  // Unfilled Absences
  const unfilledAbsencesDetails = flatMap(dailyReport.unfilledAbsences, a => {
    if (!a || !a.details) {
      return [];
    }

    return a.details.map(d => {
      const absenceDetail = d as AbsenceDetail;
      return {
        id: a.id,
        state: "unfilled",
        type: "absence",
        employee: a.employee
          ? {
              id: a.employee.id,
              name: `${a.employee.firstName} ${a.employee.lastName}`,
            }
          : undefined,
        absenceReason: absenceDetail.reasonUsages![0]?.absenceReason?.name,
        date: parseISO(absenceDetail.startDate),
        dateRange: getRangeDisplayText(
          absenceDetail.startDate,
          absenceDetail.endDate
        ),
        startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
        created: a.createdUtc,
      } as Detail;
    });
  });
  details.push(...unfilledAbsencesDetails);

  // Unfilled Vacancies
  const unfilledVacancyDetails = flatMap(dailyReport.filledVacancies, v => {
    if (!v || !v.details) {
      return [];
    }

    return v.details.map(d => {
      const vacancyDetail = d as VacancyDetail;
      return {
        id: v.id,
        state: "unfilled",
        type: "vacancy",
        date: parseISO(vacancyDetail.startDate),
        dateRange: getRangeDisplayText(
          vacancyDetail.startDate,
          vacancyDetail.endDate
        ),
        startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
        created: v.createdUtc,
      } as Detail;
    });
  });
  details.push(...unfilledVacancyDetails);

  // No Sub Required Absences
  const noSubRequiredAbsencesDetails = flatMap(
    dailyReport.noSubRequiredAbsences,
    a => {
      if (!a || !a.details) {
        return [];
      }

      return a.details.map(d => {
        const absenceDetail = d as AbsenceDetail;
        return {
          id: a.id,
          state: "noSubRequired",
          type: "absence",
          employee: a.employee
            ? {
                id: a.employee.id,
                name: `${a.employee.firstName} ${a.employee.lastName}`,
              }
            : undefined,
          absenceReason: absenceDetail.reasonUsages![0]?.absenceReason?.name,
          date: parseISO(absenceDetail.startDate),
          dateRange: getRangeDisplayText(
            absenceDetail.startDate,
            absenceDetail.endDate
          ),
          startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
          endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
          created: a.createdUtc,
        } as Detail;
      });
    }
  );
  details.push(...noSubRequiredAbsencesDetails);

  // Filter the list by only details that match the Date we are looking for
  const detailsForDate = details.filter(x => isEqual(x.date, date));

  return detailsForDate;
};

const getRangeDisplayText = (startDate: string, endDate: string): string => {
  const startDateAsDate = parseISO(startDate);
  const endDateAsDate = parseISO(endDate);

  if (
    startDateAsDate.getDay() === endDateAsDate.getDay() &&
    startDateAsDate.getMonth() === endDateAsDate.getMonth()
  ) {
    return format(startDateAsDate, "MMM d");
  } else {
    return `${format(startDateAsDate, "MMM d")} - ${format(
      endDateAsDate,
      "MMM d"
    )}`;
  }
};

const getUnfilled = (details: Detail[]): Detail[] => {
  const unfilled = details.filter(x => x.state === "unfilled");
  return unfilled;
};

const getFilled = (details: Detail[]): Detail[] => {
  const filled = details.filter(x => x.state === "filled");
  return filled;
};

const getNoSubRequired = (details: Detail[]): Detail[] => {
  const noSubRequired = details.filter(x => x.state === "noSubRequired");
  return noSubRequired;
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
                  <Grid item xs={2}>
                    <div className={classes.employeeSection}>
                      <Checkbox color="primary" />
                      <div>
                        <div>{d.employee?.name}</div>
                        <div className={classes.detailSubText}>
                          ** POSITION **
                        </div>
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={2}>
                    <div>{d.absenceReason}</div>
                    <div className={classes.detailSubText}>{d.dateRange}</div>
                  </Grid>
                  <Grid item xs={2}>
                    <div>** LOCATION **</div>
                    <div
                      className={classes.detailSubText}
                    >{`${d.startTime} - ${d.endTime}`}</div>
                  </Grid>
                  <Grid item xs={2}>
                    <div>{d.created}</div>
                  </Grid>
                  <Grid item xs={1}>
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
                  <Grid item xs={2}>
                    <div>{`#${d.id}`}</div>
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
