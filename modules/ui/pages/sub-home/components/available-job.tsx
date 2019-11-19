import {
  Grid,
  InputLabel,
  Button,
  Typography,
  IconButton,
  makeStyles,
  Popper,
  Fade,
} from "@material-ui/core";
import { ReceiptOutlined } from "@material-ui/icons";
import * as React from "react";
import parseISO from "date-fns/parseISO";
import isEqual from "date-fns/isEqual";
import format from "date-fns/format";
import { useTranslation } from "react-i18next";
import { AvailableJobDetail } from "./available-job-detail";
import { formatIsoDateIfPossible } from "helpers/date";

type Props = {
  vacancy: {
    id: string;
    vacancyDetails: {
      locationName: string;
      startTimeLocal: string | null;
      endTimeLocal: string | null;
      dayPortion: number;
    }[];
    orgName: string;
    positionTypeName: string;
    employeeName: string | null;
    startTimeLocal: string;
    endTimeLocal: string;
    notesToReplacement: string | null;
    dayPortion: number;
  };
  onAccept?: () => void;
  onDismiss?: () => void;
  shadeRow: boolean;
};

export const AvailableJob: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const [notesAnchor, setNotesAnchor] = React.useState<null | HTMLElement>(
    null
  );

  const vacancy = props.vacancy;

  const startDate = parseISO(vacancy.startTimeLocal);
  const endDate = parseISO(vacancy.endTimeLocal);
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
    ...new Set(vacancy.vacancyDetails.map(d => d.locationName)),
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

  const parseDayPortion = (dayPortion: number) => {
    if (dayPortion === 0.5) {
      return "Half Day";
    } else if (dayPortion === 1) {
      return "Full Day";
    } else if (dayPortion > 1) {
      return "Full Days";
    } else {
      return "";
    }
  };

  return (
    <>
      <Grid
        container
        justify={"flex-start"}
        spacing={2}
        className={props.shadeRow ? classes.shadedRow : undefined}
      >
        <Grid item xs={1}>
          <Typography variant="h6">{vacancyDates}</Typography>
          <Typography className={classes.lightText}>
            {vacancyDaysOfWeek}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography className={classes.locationText}>
            {locationNameText}
          </Typography>
          <Typography className={classes.lightText}>
            {vacancy.orgName}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="h6">{vacancy.positionTypeName}</Typography>
          <Typography
            className={classes.lightText}
          >{`for ${vacancy.employeeName}`}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h6">{`${Math.round(
            vacancy.dayPortion
          )} ${parseDayPortion(vacancy.dayPortion)}`}</Typography>
          <Typography className={classes.lightText}>{`${formatIsoDateIfPossible(
            vacancy.startTimeLocal,
            "h:mm aaa"
          )} - ${formatIsoDateIfPossible(
            vacancy.endTimeLocal,
            "h:mm aaa"
          )}`}</Typography>
        </Grid>
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
          {<Button onClick={props.onDismiss}>{t("Dismiss")}</Button>}
        </Grid>
        <Grid item xs={1}>
          {expanded || vacancy.vacancyDetails.length === 1 ? (
            <Button variant="outlined" onClick={props.onAccept}>
              {t("Accept")}
            </Button>
          ) : (
            <Button variant="outlined" onClick={() => setExpanded(!expanded)}>
              {t("View")}
            </Button>
          )}
        </Grid>
        {expanded && (
          <>
            {vacancy.vacancyDetails.map(
              (
                detail: {
                  locationName: string;
                  startTimeLocal: string | null;
                  endTimeLocal: string | null;
                  dayPortion: number;
                },
                index
              ) => (
                <AvailableJobDetail
                  locationName={detail.locationName}
                  dayPortion={parseDayPortion(detail.dayPortion)}
                  startTimeLocal={detail.startTimeLocal ?? ""}
                  endTimeLocal={detail.endTimeLocal ?? ""}
                  shadeRow={index % 2 != 0}
                />
              )
            )}
            <Grid container justify={"flex-end"}>
              <Grid item>
                <Button onClick={() => setExpanded(!expanded)}>
                  {t("Collapse")}
                </Button>
              </Grid>
            </Grid>
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
}));
