import {
  Typography,
  IconButton,
  makeStyles,
  Popper,
  Fade,
  Link,
} from "@material-ui/core";
import { Directions, LocalPhone, ReceiptOutlined } from "@material-ui/icons";
import * as React from "react";
import { parseISO, isTomorrow, isToday, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { formatIsoDateIfPossible } from "helpers/date";
import { Section } from "ui/components/section";
import { useIsMobile } from "hooks";
import { SubSpecificAssignmentRoute } from "ui/routes/sub-specific-assignment";
import { useHistory } from "react-router";

export type VacancyDetail = {
  id: string;
  startDate: string;
  startTimeLocal: string;
  endTimeLocal: string;
  assignment?: {
    id: string;
    startTimeLocal?: string;
    endTimeLocal?: string;
  } | null;
  location?: {
    name: string;
    address1?: string | null;
    city?: string | null;
    stateName?: string | null;
    postalCode?: string | null;
    phoneNumber?: string | null;
  } | null;
  vacancy?: {
    notesToReplacement?: string | null;
    position?: {
      title: string;
    } | null;
    absence?: {
      employee?: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  } | null;
  vacancyReason?: {
    name: string;
  } | null;
};

type Props = {
  vacancyDetail: VacancyDetail;
  shadeRow: boolean;
  className?: string;
  actingAsSubstitute?: boolean;
};

export const AssignmentCard: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();

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

  const isFromVacancy = React.useMemo(() => {
    return !!vacancyDetail.vacancyReason;
  }, [vacancyDetail]);

  const parsedDay = parseISO(vacancyDetail.startTimeLocal);
  const dayLabel = isToday(parsedDay)
    ? t("Today,")
    : isTomorrow(parsedDay)
    ? t("Tomorrow,")
    : isMobile
    ? `${format(parsedDay, "EEE")},`
    : `${format(parsedDay, "EEEE")},`;

  const mapUrl = encodeURI(
    `https://www.google.com/maps/search/?api=1&query=${vacancyDetail.location?.address1}, ${vacancyDetail.location?.city}, ${vacancyDetail.location?.stateName} ${vacancyDetail.location?.postalCode}`
  );

  const goToAssignment = (assignmentId: string) => {
    const url = SubSpecificAssignmentRoute.generate({
      assignmentId,
    });
    history.push(url);
  };

  const assignmentId = props.actingAsSubstitute ? (
    <Link
      className={classes.action}
      onClick={() => goToAssignment(vacancyDetail.assignment?.id ?? "")}
    >{`(#C${vacancyDetail.assignment?.id})`}</Link>
  ) : (
    `(#C${vacancyDetail.assignment?.id})`
  );

  const dateHeader = (
    <>
      <Typography variant="h6" className={classes.dateHeader}>
        {dayLabel}
      </Typography>
      {isMobile && (
        <Typography variant="h6" className={classes.dateHeader}>
          {format(parsedDay, "MMM d")}
        </Typography>
      )}
      {!isMobile && (
        <>
          <Typography variant="h6" className={classes.dateHeader}>
            {format(parsedDay, "MMM d")}
          </Typography>
          {assignmentId}
        </>
      )}
    </>
  );

  const renderIcons = () => {
    return (
      <div className={classes.iconButtons}>
        <IconButton href={mapUrl} target={"_blank"} rel={"noreferrer"}>
          <Directions />
        </IconButton>
        {vacancyDetail.location?.phoneNumber && isMobile ? (
          <IconButton
            href={`tel:${vacancyDetail.location?.phoneNumber}`}
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
                    {vacancyDetail.location?.phoneNumber}
                  </div>
                </Fade>
              )}
            </Popper>
          </>
        )}
        {vacancyDetail.vacancy?.notesToReplacement && (
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
                    {vacancyDetail.vacancy?.notesToReplacement}
                  </div>
                </Fade>
              )}
            </Popper>
          </>
        )}
      </div>
    );
  };

  return (
    <Section className={`${classes.section} ${props.className}`} raised>
      <div className={classes.wrapper}>
        {dateHeader}
        {isMobile && <Typography variant="h6">{assignmentId}</Typography>}
        <Typography className={classes.text}>
          {vacancyDetail.location?.name}
        </Typography>
        {!isFromVacancy && (
          <Typography className={classes.text}>{`${
            vacancyDetail.vacancy?.position?.title
          } ${t("for")} ${
            vacancyDetail.vacancy?.absence?.employee?.firstName
          } ${vacancyDetail.vacancy?.absence?.employee?.lastName}`}</Typography>
        )}
        {isFromVacancy && (
          <Typography className={classes.text}>{`${t("for Vacancy")}: ${
            vacancyDetail.vacancy?.position?.title
          }`}</Typography>
        )}
        <Typography className={classes.text}>{`${formatIsoDateIfPossible(
          vacancyDetail.assignment?.startTimeLocal,
          "h:mm aaa"
        )} - ${formatIsoDateIfPossible(
          vacancyDetail.assignment?.endTimeLocal,
          "h:mm aaa"
        )}`}</Typography>
        {renderIcons()}
      </div>
    </Section>
  );
};

export const useStyles = makeStyles(theme => ({
  iconButtons: {
    position: "absolute",
    top: "0",
    right: "0",
  },
  wrapper: {
    position: "relative",
  },
  section: {
    marginBottom: theme.spacing(1),

    [theme.breakpoints.down("sm")]: {
      marginBottom: theme.spacing(0),
    },
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  text: {
    fontSize: theme.typography.pxToRem(14),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
  action: {
    cursor: "pointer",
  },
  dateHeader: {
    display: "inline-block",
    marginRight: theme.typography.pxToRem(5),
  },
}));
