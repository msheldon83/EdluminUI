import { Button, makeStyles, Link } from "@material-ui/core";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { AssignmentDetails } from "ui/components/substitutes/assignment-details";
import { ExpandOrCollapseIndicator } from "ui/components/substitutes/expand-or-collapse-indicator";
import { NotesPopper } from "ui/components/substitutes/notes-popper";
import { AvailableJobDetail } from "./available-job-detail";
import { isBefore, parseISO } from "date-fns";
import { Warning } from "@material-ui/icons";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { VacancyViewRoute } from "ui/routes/vacancy";

type Props = {
  vacancy: {
    id: string;
    organization: {
      id: string;
      name: string;
    };
    position?: {
      title: string;
    } | null;
    startTimeLocal?: any;
    endTimeLocal?: any;
    startDate?: any;
    endDate?: any;
    absenceId?: string | null;
    absence?: {
      employee?: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
    totalDayPortion: number;
    payInfoSummary?: { summaryLabel: string } | null;
    notesToReplacement?: string | null;
    details?: Array<{
      startTimeLocal?: string | null;
      endTimeLocal?: string | null;
      dayPortion: number;
      location?: { name: string | null } | null;
      payInfo?: { label?: string | null } | null;
    } | null> | null;
  };
  unavailableToWork?: boolean;
  onAccept: (
    vacancyId: string,
    unavailableToWork?: boolean,
    overridePreferred?: boolean
  ) => Promise<void>;
  onDismiss: (vacancyId: string) => Promise<void>;
  shadeRow: boolean;
  forSingleJob?: boolean;
  viewingAsAdmin?: boolean;
  isFavorite?: boolean;
};

export const AvailableJob: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const history = useHistory();
  const { forSingleJob, viewingAsAdmin } = props;
  const classes = useStyles({ isMobile, forSingleJob, viewingAsAdmin });
  const { t } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);

  const vacancy = props.vacancy;

  const hasDetails = vacancy.details!.length > 1;
  const acceptButtonDisabled = hasDetails && !expanded;
  const showDetails = (expanded || forSingleJob) && hasDetails;

  const handleDismiss = async () => {
    await props.onDismiss(vacancy.id);
    setExpanded(false);
  };

  return (
    <>
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
              {!forSingleJob && (
                <>
                  <div className={classes.notes}>
                    {vacancy.notesToReplacement && (
                      <NotesPopper notes={vacancy.notesToReplacement} />
                    )}
                  </div>
                  {viewingAsAdmin ? (
                    <div className={classes.actionItem}>
                      {vacancy.absenceId ? (
                        <Link
                          className={classes.action}
                          onClick={() =>
                            history.push(
                              AdminEditAbsenceRoute.generate({
                                organizationId: vacancy.organization.id,
                                absenceId: vacancy.absenceId ?? "",
                              })
                            )
                          }
                        >{`#${vacancy.absenceId}`}</Link>
                      ) : (
                        <Link
                          className={classes.action}
                          onClick={() =>
                            history.push(
                              VacancyViewRoute.generate({
                                organizationId: vacancy.organization.id,
                                vacancyId: vacancy.id,
                              })
                            )
                          }
                        >{`#V${vacancy.id}`}</Link>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        className={[
                          classes.actionItem,
                          isMobile ? classes.mobileDismiss : "",
                        ].join(" ")}
                      >
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
                          onClick={async e => {
                            e.stopPropagation();
                            await props.onAccept(
                              vacancy.id,
                              props.unavailableToWork
                            );
                          }}
                        >
                          {props.unavailableToWork && <Warning />}
                          {t("Accept")}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {showDetails && (
            <div className={classes.rowContainer}>
              {vacancy
                .details!.sort((a, b) =>
                  isBefore(
                    parseISO(a!.startTimeLocal!),
                    parseISO(b!.startTimeLocal!)
                  )
                    ? -1
                    : 1
                )
                .map((detail, index) => (
                  <AvailableJobDetail
                    locationName={detail!.location!.name ?? ""}
                    dayPortion={detail!.dayPortion}
                    payInfoLabel={detail!.payInfo?.label ?? ""}
                    startTimeLocal={detail!.startTimeLocal ?? ""}
                    endTimeLocal={detail!.endTimeLocal ?? ""}
                    shadeRow={index % 2 != 1}
                    key={index}
                    viewingAsAdmin={viewingAsAdmin}
                  />
                ))}
            </div>
          )}
        </div>
        {!forSingleJob && hasDetails && (
          <ExpandOrCollapseIndicator
            isExpanded={expanded}
            className={classes.noBorder}
          />
        )}
      </div>
    </>
  );
};

type StyleProps = {
  isMobile: boolean;
  forSingleJob?: boolean;
  viewingAsAdmin?: boolean;
};

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
    padding: props.forSingleJob ? 0 : theme.spacing(2),
    display: "flex",
    alignItems: props.isMobile ? "stretch" : "center",
    justifyContent: "space-between",
  }),
  infoContainer: (props: StyleProps) => ({
    display: "flex",
    justifyContent: "space-between",
    flex: props.viewingAsAdmin ? 5 : 3,
    flexDirection: props.isMobile ? ("column" as const) : ("row" as const),
  }),

  actionContainer: (props: StyleProps) => ({
    display: "flex",
    justifyContent: props.isMobile ? "space-between" : "space-around",
    alignItems: "center",
    flex: 1,
    flexDirection: props.isMobile
      ? ("column-reverse" as const)
      : ("row" as const),
  }),
  rowContainer: {
    display: "flex",
    flexDirection: "column",
  },

  actionItem: {
    flex: 2,
  },
  mobileDismiss: {
    display: "flex",
    alignItems: "flex-end",
  },
  notes: (props: StyleProps) => ({
    flex: props.isMobile ? 0 : 1,
  }),
  action: {
    cursor: "pointer",
  },
}));
