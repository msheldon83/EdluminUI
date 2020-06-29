import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import {
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { format, isBefore } from "date-fns";
import { DayRow } from "./types";
import { ProgressBar } from "./components/progess-bar";

const OverviewTableHead: React.FC<{}> = () => {
  const { t } = useTranslation();
  const classes = useHeadStyles();

  return (
    <TableHead className={classes.header}>
      <TableRow>
        <TableCell />
        <TableCell />
        <TableCell align="center">{t("Total")}</TableCell>
        <TableCell align="center">{t("Verified")}</TableCell>
        <TableCell align="center">{t("Pending")}</TableCell>
      </TableRow>
    </TableHead>
  );
};

const useHeadStyles = makeStyles(theme => ({
  header: {
    borderTop: `1px solid ${theme.customColors.sectionBorder}`,
    cursor: "pointer",
    background: theme.customColors.lightGray,
  },
}));

type RowProps = DayRow & { goToDate: (date: Date) => void };

const OverviewTableRow: React.FC<RowProps> = ({
  date,
  unverifiedCount,
  totalCount,
  goToDate,
}) => {
  const classes = useRowStyles();
  return (
    <TableRow className={classes.tableRow} onClick={() => goToDate(date)}>
      <TableCell>{format(date, "EEE, MMM d")}</TableCell>
      <TableCell size="medium" align="center">
        <ProgressBar
          verifiedAssignments={totalCount - unverifiedCount}
          totalAssignments={totalCount}
        />
      </TableCell>
      <TableCell align="center">{totalCount}</TableCell>
      <TableCell align="center">{totalCount - unverifiedCount}</TableCell>
      <TableCell align="center">{unverifiedCount}</TableCell>
    </TableRow>
  );
};

const useRowStyles = makeStyles(theme => ({
  tableRow: {
    borderTop: `1px solid ${theme.customColors.sectionBorder}`,
    cursor: "pointer",

    "&:nth-child(even)": {
      background: theme.customColors.lightGray,
    },

    "&:hover": {
      background: theme.customColors.lightGray,
    },
  },
}));

type Props = {
  dates: DayRow[];
  goToDate: (date: Date) => void;
};

export const VerifyOverviewUI: React.FC<Props> = ({ dates, goToDate }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  if (dates.length == 0)
    return (
      <Typography>
        {t("There are no assignments in the given range.")}
      </Typography>
    );

  const sortedDates = dates.sort((d1, d2) =>
    isBefore(d1.date, d2.date) ? 1 : -1
  );

  return (
    <>
      {dates.every(({ unverifiedCount }) => unverifiedCount == 0) && (
        <Grid className={classes.allVerified}>
          <Typography variant="h5">
            {t("Hooray! Your job is done here!")}
          </Typography>
        </Grid>
      )}
      <Table className={classes.table}>
        <colgroup>
          <col className={classes.date} />
          <col className={classes.progress} />
          <col />
          <col />
          <col />
        </colgroup>
        <OverviewTableHead />
        <TableBody>
          {dates.map((d, i) => (
            <OverviewTableRow key={i} {...d} goToDate={goToDate} />
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  allVerified: {
    backgroundColor: "rgba(132, 207, 163, 0.2)",
    borderRadius: theme.spacing(0.5),
    border: `1px solid ${theme.customColors.success}`,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  table: {
    tableLayout: "fixed",
    borderBottom: `1px solid ${theme.customColors.sectionBorder}`,
    borderLeft: `1px solid ${theme.customColors.sectionBorder}`,
    borderRight: `1px solid ${theme.customColors.sectionBorder}`,
  },
  date: {
    width: "15%",
  },
  progress: {
    width: "60%",
  },
}));
