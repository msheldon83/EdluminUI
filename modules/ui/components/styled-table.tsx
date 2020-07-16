import * as React from "react";
import {
  Button,
  IconButton,
  makeStyles,
  Grid,
  Chip,
  Typography,
  withStyles,
  createStyles,
  Theme,
  TableContainerProps,
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { PaginationControls } from "ui/components/pagination-controls";

const PaperTableContainer: React.FC<TableContainerProps> = ({ ...props }) => (
  <TableContainer component={Paper} {...props} />
);

export const StyledTableContainer = withStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
    },
  })
)(PaperTableContainer);

export const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderTop: `1px solid ${theme.customColors.sectionBorder}`,
      "&:nth-of-type(even)": {
        backgroundColor: theme.customColors.lightGray,
      },
      "&:last-of-type": {
        borderBottom: `1px solid ${theme.customColors.sectionBorder}`,
      },
    },
    head: {
      borderTop: `1px solid ${theme.customColors.sectionBorder}`,
      backgroundColor: theme.customColors.lightGray,
    },
  })
)(TableRow);

export const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      color: `${theme.palette.secondary.main}`,
      fontSize: theme.typography.body1.fontSize,
      fontWeight: "bold",
    },
    body: {
      color: `${theme.palette.secondary.main}`,
    },
  })
)(TableCell);
