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
import { TFunction } from "i18next";
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

  const handleDismiss = async () => {
    await props.onDismiss(vacancy.organization.id, vacancy.id);
    setExpanded(false);
  };

  const renderNotesPopper = (notes: string) => {
    return (
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
              <div className={classes.paper}>{notes}</div>
            </Fade>
          )}
        </Popper>
      </>
    );
  };

  return (
    <>
      <Grid
        container
        justify="flex-start"
        alignItems="flex-start"
        spacing={1}
        className={props.shadeRow ? classes.shadedRow : classes.nonShadedRow}
        item
      >
        <Grid
          item
          container
          direction={isMobile ? "column" : "row"}
          justify="flex-start"
          alignItems={isMobile ? "flex-start" : "center"}
          spacing={1}
          xs={isMobile ? 10 : 12}
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
            <Typography className={classes.text}>
              {locationNameText ?? t("Unknown")}
            </Typography>
            <Typography className={classes.lightText}>
              {vacancy.organization.name}
            </Typography>
          </Grid>
          <Grid item xs={isMobile ? 12 : 2}>
            <Typography className={classes.text}>
              {vacancy.position!.name}
            </Typography>
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
                <Typography className={classes.text}>{`${Math.round(
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
          {!props.forSingleJob && !isMobile && (
            <>
              <Grid item xs={1}>
                {vacancy.notesToReplacement &&
                  renderNotesPopper(vacancy.notesToReplacement)}
              </Grid>
              <Grid item xs={1}>
                {
                  <Button
                    onClick={() => handleDismiss()}
                    className={classes.lightUnderlineText}
                  >
                    {t("Dismiss")}
                  </Button>
                }
              </Grid>
              <Grid item xs={1}>
                {renderAcceptViewButton(
                  expanded || vacancy.details!.length === 1,
                  props.onAccept,
                  setExpanded,
                  vacancy.organization.id,
                  vacancy.id,
                  t
                )}
              </Grid>
            </>
          )}
        </Grid>
        {isMobile && (
          <>
            <div className={classes.mobileAccept}>
              {renderAcceptViewButton(
                expanded || vacancy.details!.length === 1,
                props.onAccept,
                setExpanded,
                vacancy.organization.id,
                vacancy.id,
                t
              )}
            </div>
            {vacancy.notesToReplacement && (
              <div className={classes.mobileNotes}>
                {renderNotesPopper(vacancy.notesToReplacement)}
              </div>
            )}
            {!expanded && (
              <div className={classes.mobileDismiss}>
                <Button
                  onClick={() => handleDismiss()}
                  className={classes.lightUnderlineText}
                >
                  {t("Dismiss")}
                </Button>
              </div>
            )}
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
                shadeRow={index % 2 != 1}
                key={index}
              />
            ))}
          </>
        )}
        {!props.forSingleJob && expanded && (
          <Grid container>
            <Grid
              container
              justify={isMobile ? "flex-start" : "flex-end"}
              item
              xs={isMobile ? 6 : 12}
            >
              <Grid item>
                <Button
                  onClick={() => setExpanded(!expanded)}
                  className={classes.lightBlueUnderlineText}
                >
                  {t("Collapse")}
                </Button>
              </Grid>
            </Grid>

            {isMobile && (
              <Grid container justify={"flex-end"} item xs={expanded ? 6 : 12}>
                <Grid item>
                  <Button
                    onClick={() =>
                      props.onDismiss(vacancy.organization.id, vacancy.id)
                    }
                    className={classes.lightUnderlineText}
                  >
                    {t("Dismiss")}
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
    </>
  );
};

const renderAcceptViewButton = (
  expanded: boolean,
  onAccept: (orgId: string, vacancyId: string) => Promise<void>,
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>,
  orgId: string,
  vacancyId: string,
  t: TFunction
) => {
  return expanded ? (
    <Button variant="outlined" onClick={() => onAccept(orgId, vacancyId)}>
      {t("Accept")}
    </Button>
  ) : (
    <Button variant="outlined" onClick={() => setExpanded(!expanded)}>
      {t("View")}
    </Button>
  );
};

export const useStyles = makeStyles(theme => ({
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  wrapper: {
    position: "relative",
  },
  text: {
    fontSize: theme.typography.pxToRem(14),
  },
  lightText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.edluminSubText,
  },
  lightUnderlineText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.edluminSubText,
    textDecoration: "underline",
  },
  lightBlueUnderlineText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.blue,
    textDecoration: "underline",
  },
  nonShadedRow: {
    position: "relative",
    marginBottom: theme.spacing(1),
    width: "100%",
    paddingLeft: theme.spacing(1),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    position: "relative",
    marginBottom: theme.spacing(1),
    width: "100%",
    paddingLeft: theme.spacing(1),
  },
  dayPartContainer: {
    display: "flex",
  },
  dayPart: {
    paddingLeft: theme.spacing(),
  },
  mobileAccept: {
    position: "absolute",
    top: "0",
    right: "0",
    padding: theme.spacing(1),
  },
  mobileDismiss: {
    position: "absolute",
    bottom: "0",
    right: "0",
    padding: theme.spacing(1),
  },
  mobileNotes: {
    position: "absolute",
    top: "50%",
    right: "0",
    padding: theme.spacing(1),
  },
}));
