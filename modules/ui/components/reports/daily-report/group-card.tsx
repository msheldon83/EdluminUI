import * as React from "react";
import {
  makeStyles,
  CardContent,
  Card,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Detail, CardType } from "./helpers";
import { round, uniqWith } from "lodash-es";
import clsx from "clsx";
import { useState } from "react";
import { TFunction } from "i18next";

type Props = {
  cardType: CardType;
  details: Detail[];
  countOverride?: number;
  totalOverride?: number;
  onClick: (c: CardType) => void;
  activeCard?: CardType | undefined;
  showPercentInLabel?: boolean;
  showFractionCount?: boolean;
};

type CardData = {
  type: CardType;
  count: number;
  total: number;
  label: string;
  countClass: string;
  barClass: string;
  unfilledBarClass: string;
};

export const GroupCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const data = getCardData(
    props.cardType,
    props.details,
    props.countOverride,
    props.totalOverride,
    classes,
    t
  );
  if (!data) {
    return null;
  }

  const isActiveCard = props.activeCard
    ? props.cardType === props.activeCard
    : true;
  let percentValue = round((data.count / data.total) * 100, 2);
  let percentLabel = percentValue
    ? `${data.label} (${percentValue}%)`
    : data.label;
  if (props.cardType === "total") {
    const employeeOnlyAbsences = props.details.filter(
      x => x.employee && !x.isClosed
    );
    const uniqueEmployees = uniqWith(
      employeeOnlyAbsences,
      (a, b) => a.employee!.id === b.employee!.id
    );
    /* For Total, we want the progess bar to show the percentage of 
        Contracted Employees who ARE NOT absent, but we want the label
        to show the percentage of those who ARE absent.
    */
    percentValue = 100 - round((uniqueEmployees.length / data.total) * 100, 2);
    const percentPresent = round(Math.abs(percentValue - 100), 2);
    percentLabel =
      isNaN(percentPresent) || !isFinite(percentPresent)
        ? data.label
        : `${data.label} (${percentPresent}% ${t("absent")})`;
  }

  return (
    <div onClick={() => props.onClick(props.cardType)}>
      <Card
        classes={{
          root: clsx({
            [classes.cardRoot]: true,
            [classes.inactiveCard]: !isActiveCard,
            [classes.cardSelection]: !isActiveCard || !props.activeCard,
          }),
        }}
      >
        <CardContent
          classes={{
            root: classes.cardContentRoot,
          }}
        >
          <div className={classes.cardContent}>
            <Typography variant="h5" className={data.countClass}>
              {props.showFractionCount && data.count !== data.total
                ? `${data.count}/${data.total}`
                : data.count}
            </Typography>
            <Typography variant="h6" className={classes.cardSubText}>
              {props.showPercentInLabel ? percentLabel : data.label}
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={isNaN(percentValue) ? 0 : percentValue}
            className={classes.cardPercentage}
            classes={{
              colorPrimary: data.unfilledBarClass,
              barColorPrimary: data.barClass,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  cardRoot: {
    width: theme.typography.pxToRem(250),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  cardSelection: {
    cursor: "pointer",
    "&:hover": {
      boxShadow:
        "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24)",
      opacity: 1,
    },
  },
  inactiveCard: {
    opacity: 0.5,
  },
  cardContentRoot: {
    padding: "0 !important",
  },
  cardContent: {
    padding: theme.spacing(2),
  },
  cardSubText: {
    color: theme.customColors.edluminSubText,
  },
  cardPercentage: {
    height: theme.typography.pxToRem(8),
  },
  unfilledCount: {
    color: "rgba(198, 40, 40, 1)",
  },
  unfilledCardBar: {
    backgroundColor: "rgba(198, 40, 40, 1)",
  },
  unfilledCardBarUnfilled: {
    backgroundColor: "rgba(198, 40, 40, 0.1)",
  },
  filledCount: {
    color: "rgba(9, 158, 71, 1)",
  },
  filledCardBar: {
    backgroundColor: "rgba(9, 158, 71, 1)",
  },
  filledCardBarUnfilled: {
    backgroundColor: "rgba(9, 158, 71, 0.1)",
  },
  noSubRequiredCount: {
    color: "rgba(111, 111, 111, 1)",
  },
  noSubRequiredCardBar: {
    backgroundColor: "rgba(111, 111, 111, 1)",
  },
  noSubRequiredCardBarUnfilled: {
    backgroundColor: "rgba(111, 111, 111, 0.1)",
  },
  totalCount: {
    color: "rgba(33, 150, 243, 1)",
  },
  totalCardBar: {
    backgroundColor: "rgba(33, 150, 243, 1)",
  },
  totalCardBarUnfilled: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  awaitingVerificationCount: {
    color: theme.customColors.eduBlack,
  },
  awaitingVerificationCardBar: {
    backgroundColor: "#E5E5E5",
  },
  awaitingVerificationCardBarUnfilled: {
    backgroundColor: "#E5E5E5",
  },
}));

const getCardData = (
  cardType: CardType,
  details: Detail[],
  countOverride: number | undefined,
  totalOverride: number | undefined,
  classes: any,
  t: TFunction
): CardData | undefined => {
  let data: CardData | undefined = undefined;
  switch (cardType) {
    case "unfilled": {
      data = {
        type: "unfilled",
        count:
          countOverride ??
          details.filter(x => x.state === "unfilled" && !x.isClosed).length,
        total:
          totalOverride ??
          details.filter(
            x => (x.state === "unfilled" || x.state === "filled") && !x.isClosed
          ).length,
        label: t("Unfilled"),
        countClass: classes.unfilledCount,
        barClass: classes.unfilledCardBar,
        unfilledBarClass: classes.unfilledCardBarUnfilled,
      };
      break;
    }
    case "filled": {
      data = {
        type: "filled",
        count:
          countOverride ??
          details.filter(x => x.state === "filled" && !x.isClosed).length,
        total:
          totalOverride ??
          details.filter(
            x => (x.state === "unfilled" || x.state === "filled") && !x.isClosed
          ).length,
        label: t("Filled"),
        countClass: classes.filledCount,
        barClass: classes.filledCardBar,
        unfilledBarClass: classes.filledCardBarUnfilled,
      };
      break;
    }
    case "noSubRequired": {
      data = {
        type: "noSubRequired",
        count:
          countOverride ??
          details.filter(x => x.state === "noSubRequired").length,
        total: totalOverride ?? details.length,
        label: t("No sub required"),
        countClass: classes.noSubRequiredCount,
        barClass: classes.noSubRequiredCardBar,
        unfilledBarClass: classes.noSubRequiredCardBarUnfilled,
      };
      break;
    }
    case "total": {
      data = {
        type: "total",
        count: countOverride ?? details.filter(x => !x.isClosed).length,
        total: totalOverride ?? 0,
        label: t("Total"),
        countClass: classes.totalCount,
        barClass: classes.totalCardBar,
        unfilledBarClass: classes.totalCardBarUnfilled,
      };
      break;
    }
    case "awaitingVerification": {
      data = {
        type: "awaitingVerification",
        count: countOverride ?? 0,
        total: totalOverride ?? 0,
        label: t("Awaiting verification"),
        countClass: classes.awaitingVerificationCount,
        barClass: classes.awaitingVerificationCardBar,
        unfilledBarClass: classes.awaitingVerificationCardBarUnfilled,
      };
    }
  }

  return data;
};
