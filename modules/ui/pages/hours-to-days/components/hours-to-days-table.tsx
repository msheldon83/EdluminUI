import * as React from "react";
import { useTranslation } from "react-i18next";
import { HoursToDaysRow } from "./hours-to-days-row";
import { Button, Grid, makeStyles } from "@material-ui/core";
import { DayConversion } from "../types";
import { FormikErrors } from "formik";
import clsx from "clsx";

type Props = {
  mainPrefix: string;
  mainValues: Partial<DayConversion>[];
  mainErrors?: string[] | FormikErrors<Partial<DayConversion>>[];
  catchAllValue: Partial<DayConversion>;
  catchAllPrefix: string;
  catchAllError?: FormikErrors<Partial<DayConversion>>;
  addRow: (
    mainValues: Partial<DayConversion>[],
    catchAllValue: Partial<DayConversion>
  ) => void;
  deleteRow: (mainValues: Partial<DayConversion>[], i: number) => void;
  extraActions?: React.ReactNode;
};

const formatMinutes = (minutes?: number) =>
  minutes
    ? `${Math.floor(minutes / 60)}:${(minutes % 60)
        .toString()
        .padStart(2, "0")}`
    : "...";

export const HoursToDaysTable: React.FC<Props> = ({
  mainPrefix,
  mainValues,
  mainErrors,
  catchAllValue,
  catchAllPrefix,
  catchAllError,
  addRow,
  deleteRow,
  extraActions,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div>
      <Grid container>
        <Grid item container className={classes.row}>
          <Grid item xs={1} className={classes.headerCell} />
          <Grid item xs={3} className={classes.headerCell}>
            {t("Up to")}
          </Grid>
          <Grid item xs={4} className={classes.headerCell}>
            {t("Display Name")}
          </Grid>
          <Grid item xs={4} className={classes.headerCell}>
            {t("Day equivalent")}
          </Grid>
        </Grid>
        {mainValues.map((_, i) => {
          const key = `${mainPrefix}.${i}`;
          return (
            <HoursToDaysRow
              key={key}
              keyPrefix={key}
              className={clsx(
                classes.row,
                i % 2 ? classes.shadedRow : undefined
              )}
              deleteThisRow={() => deleteRow(mainValues, i)}
              error={
                mainErrors
                  ? (mainErrors[i] as FormikErrors<DayConversion> | undefined)
                  : undefined
              }
            />
          );
        })}
        <HoursToDaysRow
          keyPrefix={catchAllPrefix}
          error={catchAllError}
          className={clsx(
            classes.row,
            mainValues.length % 2 ? classes.shadedRow : undefined
          )}
          headerText={
            mainValues.length
              ? `${t("Greater than")} ${formatMinutes(
                  mainValues[mainValues.length - 1].maxMinutes
                )}`
              : t("All hours") ?? ""
          }
        />
      </Grid>
      <Grid container>
      <Button
        variant="outlined"
        onClick={() => addRow(mainValues, catchAllValue)}
      >
        {t("Add row")}
      </Button>
      {extraActions}
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  row: {
    padding: theme.spacing(1),
  },
  headerCell: {
    paddingRight: theme.spacing(4),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
}));
