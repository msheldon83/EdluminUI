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

type Props = {
  cardType: CardType;
  details: Detail[];
  onClick: (c: CardType) => void;
};

type CardData = {
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

  let data: CardData | undefined = undefined;
  switch (props.cardType) {
    case "unfilled": {
      data = {
        count: props.details.filter(x => x.state === "unfilled").length,
        total: props.details.length,
        label: t("Unfilled"),
        countClass: classes.unfilledCount,
        barClass: classes.unfilledCardBar,
        unfilledBarClass: classes.unfilledCardBarUnfilled,
      };
      break;
    }
    case "filled": {
      data = {
        count: props.details.filter(x => x.state === "filled").length,
        total: props.details.length,
        label: t("Filled"),
        countClass: classes.filledCount,
        barClass: classes.filledCardBar,
        unfilledBarClass: classes.filledCardBarUnfilled,
      };
      break;
    }
    case "noSubRequired": {
      data = {
        count: props.details.filter(x => x.state === "noSubRequired").length,
        total: props.details.length,
        label: t("No sub required"),
        countClass: classes.noSubRequiredCount,
        barClass: classes.noSubRequiredCardBar,
        unfilledBarClass: classes.noSubRequiredCardBarUnfilled,
      };
      break;
    }
    case "total": {
      data = {
        count: props.details.length,
        total: props.details.length,
        label: t("Total"),
        countClass: classes.totalCount,
        barClass: classes.totalCardBar,
        unfilledBarClass: classes.totalCardBarUnfilled,
      };
      break;
    }
  }

  if (!data) {
    return null;
  }

  const percentValue = (data.count / data.total) * 100;
  return (
    <div onClick={() => props.onClick(props.cardType)}>
      <Card
        classes={{
          root: classes.cardRoot,
        }}
      >
        <CardContent
          classes={{
            root: classes.cardContentRoot,
          }}
        >
          <div className={classes.cardContent}>
            <Typography variant="h5" className={data.countClass}>
              {data.count}
            </Typography>
            <Typography variant="h6" className={classes.cardSubText}>
              {percentValue ? `${data.label} (${percentValue}%)` : data.label}
            </Typography>
          </div>
          <LinearProgress
            variant="determinate"
            value={percentValue}
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
    cursor: "pointer",
    "&:hover": {
      boxShadow:
        "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24)",
    },
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
}));
