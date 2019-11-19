import * as React from "react";
import { Vacancy, Maybe, VacancyDetail } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { getDateRangeDisplayText, convertStringToDate } from "helpers/date";
import { Fragment } from "react";
import { format, isAfter } from "date-fns";
import { groupBy, differenceWith, difference, uniqWith } from "lodash-es";
import { isWithinInterval } from "date-fns/esm";

type Props = {
  vacancies: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
};

const getScheduleLettersArray = () => {
  return new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!props.vacancies || !props.vacancies.length) {
    return <></>;
  }

  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);
  const firstVacancy = sortedVacancies[0];
  const lastVacancy = sortedVacancies[sortedVacancies.length - 1];
  const totalVacancyDays = sortedVacancies.reduce((total, v) => {
    return v.numDays ? total + v.numDays : total;
  }, 0);

  // Build the Vacancy Details header text
  const dayLengthDisplayText =
    totalVacancyDays > 1
      ? `${totalVacancyDays} days`
      : `${totalVacancyDays} day`;
  let headerText = getDateRangeDisplayText(
    convertStringToDate(firstVacancy.startTimeLocal),
    convertStringToDate(lastVacancy.endTimeLocal)
  );
  headerText = props.positionName
    ? `${headerText} (${dayLengthDisplayText}) - ${props.positionName}`
    : `${headerText} (${dayLengthDisplayText})`;

  return (
    <Grid container spacing={2} ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12}>
          <Typography variant="h5">{headerText}</Typography>
        </Grid>
      )}
      {sortedVacancies.map(v => {
        if (v.details && v.details.length) {
          const groupedDetails = getDetailsGrouping(v.details);
          return groupedDetails.map((g, detailsIndex) => {
            return (
              <Grid
                key={detailsIndex}
                item
                container
                xs={12}
                alignItems="center"
              >
                <Grid item xs={props.equalWidthDetails ? 6 : 2}>
                  <Typography variant="h6">
                    {getDateRangeDisplayText(
                      g.startDate,
                      g.endDate ?? new Date()
                    )}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={props.equalWidthDetails ? 6 : 10}
                  className={classes.scheduleText}
                >
                  {`${t("Schedule")} ${g.schedule}`}
                </Grid>
                {g.simpleDetailItems!.map((d, i) => {
                  return (
                    <Fragment key={i}>
                      <Grid
                        item
                        xs={props.equalWidthDetails ? 6 : 2}
                        className={classes.vacancyBlockItem}
                      >
                        {`${d.startTime} - ${d.endTime}`}
                      </Grid>
                      <Grid
                        item
                        xs={props.equalWidthDetails ? 6 : 10}
                        className={classes.vacancyBlockItem}
                      >
                        {d.locationName}
                      </Grid>
                    </Fragment>
                  );
                })}
              </Grid>
            );
          });
        }
      })}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  scheduleText: {
    color: "#9E9E9E",
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
}));

type DetailsGroup = {
  startDate: Date;
  endDate?: Date;
  detailItems: DetailsItemByDate[];
  simpleDetailItems?: DetailsItem[];
  schedule?: string;
};

type DetailsItem = {
  startTime: string;
  endTime: string;
  locationId: number | null | undefined;
  locationName: string | null | undefined;
};

type DetailsItemByDate = DetailsItem & { date: Date };

const getDetailsGrouping = (
  vacancyDetails: Maybe<VacancyDetail>[]
): DetailsGroup[] => {
  // Put the details in order by start date and time
  const sortedVacancyDetails = vacancyDetails
    .slice()
    .sort((a, b) => a!.startTimeLocal - b!.startTimeLocal);

  // Group all of the details that are on the same day together
  const detailsGroupedByStartDate = groupBy(sortedVacancyDetails, d => {
    return d!.startDate;
  });

  const detailsGroupings: DetailsGroup[] = [];
  Object.entries(detailsGroupedByStartDate).forEach(([key, value]) => {
    const keyAsDate = new Date(`${key} 00:00`);
    // Look for a potential matching group to add to
    const potentialGroup = detailsGroupings.find(g => {
      if (!g.endDate) {
        return isAfter(keyAsDate, g.startDate);
      }

      return isWithinInterval(new Date(`${key} 00:00`), {
        start: g.startDate,
        end: g.endDate,
      });
    });

    // Determine if we're going to add to the Group we found or not
    let addToGroup = false;
    if (potentialGroup) {
      const valuesAsDetailItems = convertVacancyDetailsToDetailsItem(
        keyAsDate,
        value
      );
      const differences = differenceWith(
        valuesAsDetailItems,
        potentialGroup.detailItems,
        (a, b) => {
          return (
            a.startTime === b.startTime &&
            a.endTime === b.endTime &&
            a.locationId === b.locationId
          );
        }
      );
      addToGroup = !differences.length;
    }

    if (potentialGroup && addToGroup) {
      potentialGroup.detailItems.push(
        ...convertVacancyDetailsToDetailsItem(keyAsDate, value)
      );
    } else {
      if (potentialGroup) {
        // Set the endDate of the previous Group
        potentialGroup.endDate =
          potentialGroup.detailItems[
            potentialGroup.detailItems.length - 1
          ].date;
      }

      // Add a new grouping item
      detailsGroupings.push({
        startDate: new Date(`${key} 00:00`),
        detailItems: convertVacancyDetailsToDetailsItem(keyAsDate, value),
      });
    }
  });

  if (detailsGroupings && detailsGroupings.length) {
    // Set the endDate on the last item
    const lastItem = detailsGroupings[detailsGroupings.length - 1];
    lastItem.endDate =
      lastItem.detailItems[lastItem.detailItems.length - 1].date;
  }

  // Populate the simple detail items on the groups
  detailsGroupings.forEach(g => {
    g.simpleDetailItems = uniqWith(
      g.detailItems.map(di => {
        return {
          startTime: di.startTime,
          endTime: di.endTime,
          locationId: di.locationId,
          locationName: di.locationName,
        };
      }),
      (a, b) => {
        return (
          a.startTime === b.startTime &&
          a.endTime === b.endTime &&
          a.locationId === b.locationId
        );
      }
    );
  });

  // Set the appropriate Schedule letter on like groupings
  const scheduleLetters = getScheduleLettersArray();
  let scheduleIndex = 0;
  detailsGroupings.forEach(g => {
    // Look for a matching existing group that already has a Schedule letter
    const matchedGroup = detailsGroupings.find(d => {
      if (!d.schedule || !g.simpleDetailItems || !d.simpleDetailItems) {
        return false;
      }

      // If all of the Start Times, End Times, and Locations match, this is the same Schedule
      const differences = differenceWith(
        g.simpleDetailItems,
        d.simpleDetailItems,
        (a, b) => {
          return (
            a.startTime === b.startTime &&
            a.endTime === b.endTime &&
            a.locationId === b.locationId
          );
        }
      );
      return !differences.length;
    });

    if (matchedGroup) {
      g.schedule = matchedGroup.schedule;
    } else {
      g.schedule = scheduleLetters[scheduleIndex];
      scheduleIndex = scheduleIndex + 1;
    }
  });

  return detailsGroupings;
};

const convertVacancyDetailsToDetailsItem = (
  date: Date,
  details: Maybe<VacancyDetail>[]
): DetailsItemByDate[] => {
  const detailItems = details.map(v => {
    const startTime = convertStringToDate(v!.startTimeLocal);
    const endTime = convertStringToDate(v!.endTimeLocal);
    if (!startTime || !endTime) {
      return;
    }

    return {
      date: date,
      startTime: format(startTime, "h:mm a"),
      endTime: format(endTime, "h:mm a"),
      locationId: v!.locationId,
      locationName: v!.location?.name,
    };
  });
  const populatedItems = detailItems.filter(
    d => d !== undefined
  ) as DetailsItemByDate[];
  return populatedItems;
};
