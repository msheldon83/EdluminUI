import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
import clsx from "clsx";
import { round } from "lodash-es";

type Props = {
  name: string;
  initialBalance: number;
  usedBalance: number;
  plannedBalance: number;
  remainingBalance: number;
  trackingType: AbsenceReasonTrackingTypeId;
  shadeRow: boolean;
};

export const SingleBalance: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles(props);
  const balanceTrackingType =
    props.trackingType === "DAILY" ? t("Days") : t("Hours");

  const usedBalance = round(props.usedBalance, 1);
  const plannedBalance = round(props.plannedBalance, 1);
  const remainingBalance = round(props.remainingBalance, 1);

  const usedPercentage = usedBalance / props.initialBalance;
  const plannedPercentage = plannedBalance / props.initialBalance;
  const negativeBalance = usedPercentage + plannedPercentage > 1;

  return (
    <>
      <Grid
        container
        justify="space-between"
        alignItems="center"
        spacing={2}
        className={clsx({
          [classes.shadedRow]: props.shadeRow,  
          [classes.container]: true,
        })}
      >
        <Grid item xs={2}>
          <div>{`${props.name} (${props.initialBalance} ${
            props.initialBalance === 0
              ? balanceTrackingType.substring(0, balanceTrackingType.length - 1)
              : balanceTrackingType
          })`}</div>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.barRoot}>
            {!negativeBalance ? (
              <>
                <div
                  className={clsx({
                    [classes.barUsed]: true,
                    [classes.barRoundLeft]:
                      usedPercentage > 0 && usedPercentage < 1,
                    [classes.barRoundBoth]: usedPercentage === 1,
                  })}
                />
                <div
                  className={clsx({
                    [classes.barPlanned]: true,
                    [classes.barRoundLeft]: usedPercentage === 0,
                    [classes.barRoundRight]:
                      usedPercentage + plannedPercentage === 1 &&
                      plannedPercentage < 1,
                    [classes.barRoundBoth]:
                      usedPercentage === 0 && plannedPercentage === 1,
                  })}
                />
              </>
            ) : (
              <>
                <div
                  className={clsx({
                    [classes.barUsedNegative]: true,
                    [classes.barRoundLeft]:
                      usedPercentage > 0 && usedPercentage < 1,
                    [classes.barRoundBoth]: usedPercentage > 1,
                  })}
                />
                <div
                  className={clsx({
                    [classes.barPlannedNegative]: true,
                    [classes.barRoundRight]:
                      usedPercentage > 0 && usedPercentage < 1,
                    [classes.barRoundBoth]: usedPercentage === 0,
                  })}
                />
              </>
            )}
          </div>
        </Grid>
        <Grid item xs={1}>
          <div>{usedBalance}</div>
        </Grid>
        <Grid item xs={1}>
          <div>{plannedBalance}</div>
        </Grid>
        <Grid item xs={1}>
          <div>{remainingBalance}</div>
        </Grid>
      </Grid>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
  },
  container: {
    padding: theme.spacing(1),
  },
  barRoot: {
    width: "100%",
    height: theme.typography.pxToRem(14),
    borderRadius: theme.typography.pxToRem(10),
    backgroundColor: "#E5E5E5",
  },
  barUsed: {
    height: theme.typography.pxToRem(14),
    backgroundColor: theme.customColors.blue,
    width: (props: Props) =>
      `${(props.usedBalance / props.initialBalance) * 100}%`,
    float: "left",
  },
  barPlanned: {
    height: theme.typography.pxToRem(14),
    backgroundColor: "#BBDEFB",
    width: (props: Props) =>
      `${(props.plannedBalance / props.initialBalance) * 100}%`,
    float: "left",
  },
  barUsedNegative: {
    height: theme.typography.pxToRem(14),
    backgroundColor: theme.customColors.darkRed,
    width: (props: Props) =>
      props.usedBalance >= props.initialBalance
        ? "100%"
        : `${(props.usedBalance / props.initialBalance) * 100}%`,
    float: "left",
  },
  barPlannedNegative: {
    height: theme.typography.pxToRem(14),
    backgroundColor: "#E16B6B", // TODO: Confirm with UX that this is the appropriate color
    width: (props: Props) =>
      props.usedBalance === 0
        ? "100%"
        : props.usedBalance < props.initialBalance
        ? `${((props.initialBalance - props.usedBalance) /
            props.initialBalance) *
            100}%`
        : "0%",
    float: "left",
  },
  barRoundLeft: {
    borderRadius: `${theme.typography.pxToRem(
      10
    )} 0 0 ${theme.typography.pxToRem(10)}`,
  },
  barRoundRight: {
    borderRadius: `0 ${theme.typography.pxToRem(10)} ${theme.typography.pxToRem(
      10
    )} 0`,
  },
  barRoundBoth: {
    borderRadius: theme.typography.pxToRem(10),
  },
}));
