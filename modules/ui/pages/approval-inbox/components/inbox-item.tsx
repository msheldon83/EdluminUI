import * as React from "react";
import { useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { getDateRangeDisplay } from "ui/components/employee/helpers";
import { parseISO, format, isToday } from "date-fns";
import { flatMap, uniq } from "lodash-es";
import { Maybe } from "graphql/server-types.gen";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  orgId: string;
  isSelected: boolean;
  setSelected: React.Dispatch<
    React.SetStateAction<{
      id: string;
      isNormalVacancy: boolean;
    } | null>
  >;
  isPrevious?: boolean;
  approvalState?: {
    changedLocal?: string | null;
    comments: {
      id: string;
    }[];
  } | null;
  decisions?: {
    actingOrgUserId: string;
    createdUtc: string;
  }[];
  vacancy: {
    id: string;
    isNormalVacancy: boolean;
    absenceId?: string | null;
    startDate?: string | null;
    endDate: string;
    createdLocal?: string | null;
    position?: {
      title: string;
    } | null;
    details: {
      vacancyReason?: {
        name: string;
      } | null;
    }[];
    absence?: {
      employee?: {
        firstName: string;
        lastName: string;
      } | null;
      details?:
        | Maybe<{
            reasonUsages?:
              | Maybe<{
                  absenceReason?: {
                    name: string;
                  } | null;
                }>[]
              | null;
          }>[]
        | null;
    } | null;
  };
};

export const InboxItem: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { vacancy, approvalState, decisions, isPrevious, orgId } = props;

  const userAccess = useMyUserAccess();
  const currentOrgUserId = userAccess?.me?.user?.orgUsers?.find(
    x => x?.orgId === orgId
  )?.id;

  const reasons = vacancy.isNormalVacancy
    ? uniq(vacancy.details.map(d => d?.vacancyReason?.name)).join(", ")
    : uniq(
        flatMap(
          vacancy.absence?.details?.map(d =>
            d?.reasonUsages?.map(u => u?.absenceReason?.name)
          )
        )
      ).join(", ");

  const handleClick = () => {
    props.setSelected({
      id: vacancy.isNormalVacancy ? vacancy.id : vacancy.absenceId ?? "",
      isNormalVacancy: vacancy.isNormalVacancy,
    });
  };

  const formattedChangedTime = useMemo(() => {
    const changedTime = isPrevious
      ? decisions?.find(x => x.actingOrgUserId === currentOrgUserId)?.createdUtc
      : approvalState?.changedLocal;
    if (changedTime) {
      const changedTimeDate = isPrevious
        ? new Date(changedTime)
        : parseISO(changedTime);
      return isToday(changedTimeDate)
        ? format(changedTimeDate, "h:mm a")
        : format(changedTimeDate, "h:mm a, MMM d");
    } else {
      return "";
    }
  }, [approvalState, currentOrgUserId, decisions, isPrevious]);

  return (
    <div
      className={clsx({
        [classes.container]: true,
        [classes.selectedBorder]: props.isSelected,
        [classes.notSelectedBorder]: !props.isSelected,
        [classes.previous]: props.isPrevious,
      })}
      onClick={handleClick}
    >
      <div className={classes.textContainer}>
        <div className={classes.typeText}>
          {vacancy.isNormalVacancy ? t("Vacancy") : t("Absence")}
        </div>
        <div className={[classes.typeText, classes.rightAlignedText].join(" ")}>
          {formattedChangedTime}
        </div>
      </div>

      <div className={classes.textContainer}>
        <div className={classes.nameText}>
          {vacancy.isNormalVacancy
            ? vacancy.position?.title
            : `${vacancy.absence?.employee?.firstName} ${vacancy.absence?.employee?.lastName}`}
        </div>
        {approvalState?.comments && approvalState.comments.length > 0 && (
          <div className={classes.rightAlignedText}>
            <img src={require("ui/icons/comment-solid.svg")} />
          </div>
        )}
      </div>
      <div className={classes.dateReasonContainer}>
        <div className={classes.date}>
          {getDateRangeDisplay(
            parseISO(vacancy.startDate!),
            parseISO(vacancy.endDate)
          )}
        </div>
        <div>{reasons}</div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    padding: theme.spacing(2),
    cursor: "pointer",
  },
  selectedBorder: {
    border: "1px solid #050039",
  },
  notSelectedBorder: {
    border: "1px solid #E1E1E1",
  },
  previous: {
    opacity: 0.4,
  },
  typeText: {
    fontSize: theme.typography.pxToRem(12),
    color: "#696688",
  },
  nameText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "bold",
    color: "#050039",
  },
  dateReasonContainer: {
    display: "flex",
  },
  date: {
    paddingRight: theme.spacing(1),
  },
  textContainer: {
    display: "flex",
    position: "relative",
    width: "100%",
  },
  rightAlignedText: {
    top: 0,
    right: 0,
    position: "absolute",
  },
}));
