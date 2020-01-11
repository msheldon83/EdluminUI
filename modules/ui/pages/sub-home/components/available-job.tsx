import {
  Button,
  Fade,
  IconButton,
  makeStyles,
  Popper,
} from "@material-ui/core";
import { ReceiptOutlined } from "@material-ui/icons";
import { Vacancy } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ExpandOrCollapseIndicator } from "ui/components/substitutes/expand-or-collapse-indicator";
import { AvailableJobDetail } from "./available-job-detail";
import { AssignmentDetails } from "ui/components/substitutes/assignment-details";

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
          classes.rowContainer,
          props.shadeRow ? classes.shadedRow : "",
        ].join(" ")}
      >
        <div className={classes.container}>
          <div className={classes.infoContainer}>
            <AssignmentDetails vacancy={vacancy} />
          </div>

          <div className={classes.actionContainer}>
            {!props.forSingleJob && (
              <>
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
              </>
            )}
          </div>
        </div>

        {showDetails && (
          <div className={classes.rowContainer}>
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
    justifyContent: props.isMobile ? "space-between" : "space-around",
    alignItems: "center",
    flex: 1,
    flexDirection: props.isMobile
      ? ("column-reverse" as "column-reverse")
      : ("row" as "row"),
  }),
  rowContainer: {
    display: "flex",
    flexDirection: "column",
  },

  actionItem: {
    flex: 2,
  },
  notes: {
    flex: 1,
  },
}));
