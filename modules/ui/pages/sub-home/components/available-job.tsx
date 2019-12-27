import {
  Button,
  Fade,
  Grid,
  IconButton,
  makeStyles,
  Popper,
  Typography,
} from "@material-ui/core";
import { ReceiptOutlined } from "@material-ui/icons";
import { useIsMobile } from "hooks";
import format from "date-fns/format";
import isEqual from "date-fns/isEqual";
import parseISO from "date-fns/parseISO";
import { Vacancy } from "graphql/server-types.gen";
import { formatIsoDateIfPossible } from "helpers/date";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { parseDayPortion } from "ui/components/helpers";
import { AvailableJobDetail } from "./available-job-detail";
import { DayIcon } from "ui/components/day-icon";

type Props = {
  vacancy: Pick<
    Vacancy,
    | "id"
    | "organization"
    | "position"
    | "absence"
    | "startTimeLocal"
    | "endTimeLocal"
    | "startDate"
    | "endDate"
    | "notesToReplacement"
    | "totalDayPortion"
    | "details"
  >;
  onAccept: (orgId: string, vacancyId: string) => Promise<void>;
  onDismiss: (orgId: string, vacancyId: string) => Promise<void>;
  shadeRow: boolean;
  forSingleJob?: boolean;
};

export const AvailableJob: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = React.useState(false);
  const [notesAnchor, setNotesAnchor] = React.useState<null | HTMLElement>(
    null
  );

  const vacancy = props.vacancy;

  const startDate = parseISO(vacancy.startDate);
  const endDate = parseISO(vacancy.endDate);
  let vacancyDates = format(startDate, "MMM d");
  let vacancyDaysOfWeek = format(startDate, "EEEE");
  if (!isEqual(startDate, endDate)) {
    vacancyDaysOfWeek = `${format(startDate, "EEE")} - ${format(
      endDate,
      "EEE"
    )}`;
    if (startDate.getMonth() === endDate.getMonth()) {
      vacancyDates = `${vacancyDates} - ${format(endDate, "d")}`;
    } else {
      vacancyDates = `${vacancyDates} - ${format(endDate, "MMM d")}`;
    }
  }

  const locationNames = [
    ...new Set(vacancy.details!.map(d => d!.location!.name)),
  ];
  const locationNameText =
    locationNames.length > 1
      ? `${locationNames[0]} +${locationNames.length - 1}`
      : locationNames[0];

  const handleShowNotes = (event: React.MouseEvent<HTMLElement>) => {
    setNotesAnchor(notesAnchor ? null : event.currentTarget);
  };
  const notesOpen = Boolean(notesAnchor);
  const notesId = notesOpen ? "notes-popper" : undefined;
  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        spacing={2}
        className={props.shadeRow ? classes.shadedRow : undefined}
      >
        <Grid item xs={isMobile ? 12 : 1}>
          {isMobile ? (
            <Typography variant="h6">{`${vacancyDates}, ${vacancyDaysOfWeek}`}</Typography>
          ) : (
            <>
              <Typography variant="h6">{vacancyDates}</Typography>
              <Typography className={classes.lightText}>
                {vacancyDaysOfWeek}
              </Typography>
            </>
          )}
        </Grid>
        <Grid item xs={isMobile ? 12 : 3}>
          <Typography className={classes.locationText}>
            {locationNameText ?? t("Unknown")}
          </Typography>
          <Typography className={classes.lightText}>
            {vacancy.organization.name}
          </Typography>
        </Grid>
        <Grid item xs={isMobile ? 12 : 2}>
          <Typography variant="h6">{vacancy.position!.name}</Typography>
          <Typography className={classes.lightText}>{`for ${
            vacancy.absence!.employee!.firstName
          } ${vacancy.absence!.employee!.lastName}`}</Typography>
        </Grid>
        <Grid item xs={isMobile ? 12 : 3}>
          <div className={classes.dayPartContainer}>
            <DayIcon
              dayPortion={vacancy.totalDayPortion}
              startTime={vacancy.startTimeLocal}
            />
            <div className={classes.dayPart}>
              <Typography variant="h6">{`${Math.round(
                vacancy.totalDayPortion
              )} ${parseDayPortion(t, vacancy.totalDayPortion)}`}</Typography>
              <Typography
                className={classes.lightText}
              >{`${formatIsoDateIfPossible(
                vacancy.startTimeLocal,
                "h:mm aaa"
              )} - ${formatIsoDateIfPossible(
                vacancy.endTimeLocal,
                "h:mm aaa"
              )}`}</Typography>
            </div>
          </div>
        </Grid>
        {!props.forSingleJob && (
          <>
            <Grid item xs={1}>
              {vacancy.notesToReplacement && (
                <>
                  <IconButton id={notesId} onClick={handleShowNotes}>
                    <ReceiptOutlined />
                  </IconButton>
                  <Popper
                    transition
                    open={notesOpen}
                    anchorEl={notesAnchor}
                    placement="bottom-end"
                  >
                    {({ TransitionProps }) => (
                      <Fade {...TransitionProps} timeout={150}>
                        <div className={classes.paper}>
                          {vacancy.notesToReplacement}
                        </div>
                      </Fade>
                    )}
                  </Popper>
                </>
              )}
            </Grid>
            <Grid item xs={1}>
              {
                <Button
                  onClick={() =>
                    props.onDismiss(vacancy.organization.id, vacancy.id)
                  }
                >
                  {t("Dismiss")}
                </Button>
              }
            </Grid>
            <Grid item xs={1}>
              {expanded || vacancy.details!.length === 1 ? (
                <Button
                  variant="outlined"
                  onClick={() =>
                    props.onAccept(vacancy.organization.id, vacancy.id)
                  }
                >
                  {t("Accept")}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => setExpanded(!expanded)}
                >
                  {t("View")}
                </Button>
              )}
            </Grid>
          </>
        )}
        {(expanded || props.forSingleJob) && vacancy.details!.length > 1 && (
          <>
            {vacancy.details!.map((detail, index) => (
              <AvailableJobDetail
                locationName={detail!.location!.name}
                dayPortion={detail!.dayPortion}
                startTimeLocal={detail!.startTimeLocal ?? ""}
                endTimeLocal={detail!.endTimeLocal ?? ""}
                shadeRow={index % 2 != 0}
                key={index}
              />
            ))}
            {!props.forSingleJob && (
              <Grid container justify={"flex-end"}>
                <Grid item>
                  <Button onClick={() => setExpanded(!expanded)}>
                    {t("Collapse")}
                  </Button>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  root: {
    width: 500,
  },
  typography: {
    padding: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },

  lightText: {
    fontSize: theme.typography.fontSize,
  },
  locationText: {
    fontSize: theme.typography.fontSize + 4,
  },
  boldText: {
    fontSize: theme.typography.fontSize,
    fontWeight: "bold",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
  dayPartContainer: {
    display: "flex",
  },
  dayPart: {
    paddingLeft: theme.spacing(),
  },
}));
