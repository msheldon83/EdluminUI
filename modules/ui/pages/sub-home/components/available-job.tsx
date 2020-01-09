import {
  Button,
  Fade,
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
import { ExpandOrCollapseIndicator } from "ui/components/substitutes/expand-or-collapse-indicator";

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
  const isMobile = useIsMobile();
  const classes = useStyles({ isMobile });
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const [notesAnchor, setNotesAnchor] = React.useState<null | HTMLElement>(
    null
  );

  const vacancy = props.vacancy;

  const hasDetails = vacancy.details!.length > 1;
  const acceptButtonDisabled = hasDetails && !expanded;
  const showDetails = (expanded || props.forSingleJob) && hasDetails;

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
    event.stopPropagation();
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
    <div onClick={() => setExpanded(!expanded)}>
      <div
        className={[
          classes.detailContainer,
          props.shadeRow ? classes.shadedRow : "",
        ].join(" ")}
      >
        <div className={classes.container}>
          <div className={classes.infoContainer}>
            <div className={classes.dateContainer}>
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
            </div>

            <div className={classes.location}>
              <Typography className={classes.text}>
                {locationNameText ?? t("Unknown")}
              </Typography>
              <Typography className={classes.lightText}>
                {vacancy.organization.name}
              </Typography>
            </div>

            <div className={classes.position}>
              <Typography className={classes.text}>
                {vacancy.position!.name}
              </Typography>
              <Typography className={classes.lightText}>{`for ${
                vacancy.absence!.employee!.firstName
              } ${vacancy.absence!.employee!.lastName}`}</Typography>
            </div>

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
          </div>

          <div className={classes.actionContainer}>
            <div className={classes.notes}>
              {vacancy.notesToReplacement &&
                renderNotesPopper(vacancy.notesToReplacement)}
            </div>

            <div className={classes.actionItem}>
              <Button
                onClick={() => handleDismiss()}
                className={classes.lightUnderlineText}
              >
                {t("Dismiss")}
              </Button>
            </div>
            <div className={classes.actionItem}>
              <Button
                variant="outlined"
                disabled={acceptButtonDisabled}
                onClick={() =>
                  props.onAccept(vacancy.organization.id, vacancy.id)
                }
              >
                {t("Accept")}
              </Button>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className={classes.detailContainer}>
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
          </div>
        )}
      </div>
      {!props.forSingleJob && hasDetails && (
        <ExpandOrCollapseIndicator
          isExpanded={expanded}
          className={classes.noBorder}
        />
      )}
    </div>
  );
};

type StyleProps = { isMobile: boolean };
export const useStyles = makeStyles(theme => ({
  noBorder: { border: "none" },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
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

  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.sectionBorder
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.sectionBorder
    }`,
  },

  container: (props: StyleProps) => ({
    padding: theme.spacing(2),
    display: "flex",
    alignItems: props.isMobile ? "stretch" : "center",
    justifyContent: "space-between",
  }),
  infoContainer: (props: StyleProps) => ({
    display: "flex",
    justifyContent: "space-between",
    flex: 3,
    flexDirection: props.isMobile ? ("column" as "column") : ("row" as "row"),
  }),

  actionContainer: (props: StyleProps) => ({
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
    flexDirection: props.isMobile ? ("column" as "column") : ("row" as "row"),
  }),
  detailContainer: {
    display: "flex",
    flexDirection: "column",
  },
  dateContainer: {
    flex: 4,
    padding: `0 ${theme.typography.pxToRem(4)}`,
  },
  date: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: 500,
  },
  location: { flex: 11, padding: `0 ${theme.typography.pxToRem(4)}` },
  position: { flex: 7, padding: `0 ${theme.typography.pxToRem(4)}` },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  dayPartContainer: {
    display: "flex",
    flex: 8,
    padding: `0 ${theme.typography.pxToRem(4)}`,
  },
  dayPart: {
    paddingLeft: theme.spacing(),
  },
  actionItem: {
    flex: 2,
  },
  notes: {
    flex: 1,
  },
}));
