import * as React from "react";
import { useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { getDateRangeDisplay } from "ui/components/employee/helpers";
import { parseISO, format, isToday } from "date-fns";

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
  inboxItem: {
    id: string;
    isNormalVacancy: boolean;
    teacherFirstName?: string | null;
    teacherLastName?: string | null;
    positionTitle?: string | null;
    numComments: number;
    startDate: string;
    endDate: string;
    reasons: {
      id: string;
      name: string;
    }[];
    changedUtc: string;
  };
};

export const InboxItem: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { inboxItem, isPrevious, isSelected } = props;

  const reasons = inboxItem.reasons.map(x => x.name).join(", ");

  const handleClick = () => {
    props.setSelected({
      id: inboxItem.id,
      isNormalVacancy: inboxItem.isNormalVacancy,
    });
  };

  const formattedChangedTime = useMemo(() => {
    const changedTime = new Date(inboxItem.changedUtc);
    return isToday(changedTime)
      ? format(changedTime, "h:mm a")
      : format(changedTime, "h:mm a, MMM d");
  }, [inboxItem.changedUtc]);

  return (
    <div
      className={clsx({
        [classes.container]: true,
        [classes.selectedBorder]: isSelected,
        [classes.notSelectedBorder]: !isSelected,
        [classes.previous]: isPrevious,
      })}
      onClick={handleClick}
    >
      <div className={classes.textContainer}>
        <div className={classes.typeText}>
          {inboxItem.isNormalVacancy ? t("Vacancy") : t("Absence")}
        </div>
        <div className={[classes.typeText, classes.rightAlignedText].join(" ")}>
          {formattedChangedTime}
        </div>
      </div>

      <div className={classes.textContainer}>
        <div className={classes.nameText}>
          {inboxItem.isNormalVacancy
            ? inboxItem.positionTitle
            : `${inboxItem.teacherFirstName} ${inboxItem.teacherLastName}`}
        </div>
        {inboxItem.numComments > 0 && (
          <div className={classes.rightAlignedText}>
            <img src={require("ui/icons/comment-solid.svg")} />
          </div>
        )}
      </div>
      <div className={classes.dateReasonContainer}>
        <div className={classes.date}>
          {getDateRangeDisplay(
            parseISO(inboxItem.startDate),
            parseISO(inboxItem.endDate)
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
