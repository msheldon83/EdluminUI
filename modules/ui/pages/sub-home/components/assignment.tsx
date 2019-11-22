import {
  Grid,
  Typography,
  IconButton,
  makeStyles,
  Popper,
  Fade,
} from "@material-ui/core";
import { Directions, LocalPhone, ReceiptOutlined } from "@material-ui/icons";
import * as React from "react";
import parseISO from "date-fns/parseISO";
import isTomorrow from "date-fns/isTomorrow";
import isToday from "date-fns/isTomorrow";
import format from "date-fns/format";
import { useTranslation } from "react-i18next";
import { formatIsoDateIfPossible } from "helpers/date";
import { VacancyDetail } from "graphql/server-types.gen";
import { Section } from "ui/components/section";
import { useScreenSize } from "hooks";

type Props = {
  vacancyDetail: Pick<
    VacancyDetail,
    | "id"
    | "startTimeLocal"
    | "endTimeLocal"
    | "assignment"
    | "location"
    | "vacancy"
  >;
  shadeRow: boolean;
};

export const AssignmentCard: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useScreenSize() === "mobile";

  const [notesAnchor, setNotesAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const notesOpen = Boolean(notesAnchor);
  const notesId = notesOpen ? "notes-popper" : undefined;
  const handleShowNotes = (event: React.MouseEvent<HTMLElement>) => {
    setNotesAnchor(notesAnchor ? null : event.currentTarget);
  };

  const [phoneAnchor, setPhoneAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const phoneOpen = Boolean(phoneAnchor);
  const phoneId = phoneOpen ? "phone-popper" : undefined;
  const handleShowPhone = (event: React.MouseEvent<HTMLElement>) => {
    setPhoneAnchor(phoneAnchor ? null : event.currentTarget);
  };

  const vacancyDetail = props.vacancyDetail;

  const parsedDay = parseISO(vacancyDetail.startTimeLocal);
  const dayLabel = isToday(parsedDay)
    ? "Today"
    : isTomorrow(parsedDay)
    ? "Tomorrow"
    : isMobile
    ? format(parsedDay, "EEE")
    : format(parsedDay, "EEEE");

  const mapUrl = encodeURI(
    `https://www.google.com/maps/search/?api=1&query=${
      vacancyDetail.location!.address1
    }, ${vacancyDetail.location!.city}, ${vacancyDetail.location!.stateName} ${
      vacancyDetail.location!.postalCode
    }`
  );

  const assignmentId = `(#C${vacancyDetail.assignment!.id})`;
  const dateHeader = `${dayLabel}, ${
    isMobile ? format(parsedDay, "MMM d") : format(parsedDay, "MMMM d")
  } ${!isMobile && assignmentId}`;

  return (
    <>
      <Section>
        <Grid
          container
          justify="space-between"
          alignItems="center"
          spacing={1}
          className={props.shadeRow ? classes.shadedRow : undefined}
        >
          <Grid item xs={6}>
            <Typography variant="h6">{dateHeader}</Typography>
            {isMobile && <Typography variant="h6">{assignmentId}</Typography>}
            <Typography className={classes.lightText}>
              {vacancyDetail.location!.name}
            </Typography>
            <Typography className={classes.lightText}>{`${
              vacancyDetail.vacancy!.position!.name
            } for ${vacancyDetail.vacancy!.absence!.employee!.firstName} ${
              vacancyDetail.vacancy!.absence!.employee!.lastName
            }`}</Typography>
            <Typography
              className={classes.lightText}
            >{`${formatIsoDateIfPossible(
              vacancyDetail.assignment!.startTimeLocal,
              "h:mm aaa"
            )} - ${formatIsoDateIfPossible(
              vacancyDetail.assignment!.endTimeLocal,
              "h:mm aaa"
            )}`}</Typography>
          </Grid>
          <Grid item>
            <IconButton href={mapUrl} target={"_blank"} rel={"noreferrer"}>
              <Directions />
            </IconButton>
            {vacancyDetail.location!.phoneNumber && isMobile ? (
              <IconButton
                href={`tel:${vacancyDetail.location!.phoneNumber}`}
                target={"_blank"}
                rel={"noreferrer"}
              >
                <LocalPhone />
              </IconButton>
            ) : (
              <>
                <IconButton id={phoneId} onClick={handleShowPhone}>
                  <LocalPhone />
                </IconButton>
                <Popper
                  transition
                  open={phoneOpen}
                  anchorEl={phoneAnchor}
                  placement="bottom-end"
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={150}>
                      <div className={classes.paper}>
                        {vacancyDetail.location!.phoneNumber}
                      </div>
                    </Fade>
                  )}
                </Popper>
              </>
            )}
            {vacancyDetail.vacancy!.notesToReplacement && (
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
                        {vacancyDetail.vacancy!.notesToReplacement}
                      </div>
                    </Fade>
                  )}
                </Popper>
              </>
            )}
          </Grid>
        </Grid>
      </Section>
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
