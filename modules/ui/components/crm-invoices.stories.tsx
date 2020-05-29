import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Typography, withStyles, createStyles, Theme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";

export const CRMInvoices = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.container}>
        <div className={classes.header}>Invoices</div>
        <div className={classes.invoicesTable}>
          <div className={classes.firstRow}>
            <div
              className={classes.firstRowItem}
              style={{ marginRight: "150px" }}
            >
              Date
            </div>
            <div
              className={classes.firstRowItem}
              style={{ marginRight: "100px" }}
            >
              Invoice #
            </div>
            <div
              className={classes.firstRowItem}
              style={{ marginRight: "150px" }}
            >
              PO #
            </div>
            <div className={classes.firstRowItem}>Total</div>
            <div className={classes.firstRowItem} style={{ float: "right" }}>
              Status
            </div>
          </div>
          <div className={classes.oddRow}>
            <div className={classes.rowItem} style={{ marginRight: "99px" }}>
              June 1, 2020
            </div>
            <div className={classes.link} style={{ marginRight: "110px" }}>
              123943
            </div>
            <div className={classes.link} style={{ marginRight: "156px" }}>
              Add
            </div>
            <div className={classes.rowItem}>$3105.90</div>
            <div className={classes.dueItem} style={{ float: "right" }}>
              Due August 1
            </div>
          </div>
          <div className={classes.divider}></div>
          <div className={classes.evenRow}>
            <div className={classes.rowItem} style={{ marginRight: "105px" }}>
              July 1, 2020
            </div>
            <div className={classes.link} style={{ marginRight: "102px" }}>
              1239123
            </div>
            <div className={classes.rowItem} style={{ marginRight: "10px" }}>
              1239
            </div>
            <div className={classes.link} style={{ marginRight: "115px" }}>
              Edit
            </div>
            <div className={classes.rowItem}>$3105.90</div>
            <div className={classes.paidItem} style={{ float: "right" }}>
              Paid
            </div>
          </div>
          <div className={classes.divider}></div>
        </div>
        <div className={classes.invoicePaymentWrapper}>
          <div className={classes.link}>Red Rover Technologies LLC W-9</div>
          <div className={classes.awaitingPaymentBox}>
            <div className={classes.boxHeader}>Awaiting Payment</div>
            <div className={classes.boxMiddle}>$3105.90</div>
            <div className={classes.boxFooter}>Invoice #123456 due Aug 1</div>
          </div>
          <div className={classes.noPendingInvoicesBox}>
            <div className={classes.boxHeader}>No pending invoices</div>
            <div className={classes.boxMiddle}>Thank you!</div>
            <div className={classes.boxFooter}>
              It&apos;s our pleasure to serve you
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

function createData(date: any, invoice: any, po: any, total: any, status: any) {
  return { date, invoice, po, total, status };
}

const rows = [
  createData(
    "June 1, 2020",
    123943,
    "Add",
    (3105.9).toFixed(2),
    "Due August 1"
  ),
  createData("July 1, 2020", 1239123, "1239 Edit", (3105.9).toFixed(2), "Paid"),
];

export const CRMInvoicesReact = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.container}>
        <Typography variant="h5" className={classes.header}>
          Invoices
        </Typography>
        <div className={classes.table}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <StyledHeaderTableRow>
                  <TableCell>{t("Date")}</TableCell>
                  <TableCell>{t("Invoice #")}</TableCell>
                  <TableCell>{t("PO #")}</TableCell>
                  <TableCell>{t("Total")}</TableCell>
                  <TableCell style={{ textAlign: "right" }}>
                    {t("Status")}
                  </TableCell>
                </StyledHeaderTableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <StyledTableRow key={row.invoice}>
                    <TableCell component="th" scope="row">
                      {row.date}
                    </TableCell>
                    <TableCell className={classes.reactLink}>
                      {row.invoice}
                    </TableCell>
                    <TableCell className={classes.reactLink}>
                      {row.po}
                    </TableCell>
                    <TableCell>${row.total}</TableCell>
                    <TableCell
                      className={clsx({
                        [classes.paidCell]: true,
                        [classes.paidItem]: row.status == `Paid`,
                        [classes.dueItem]: row.status != `Paid`,
                      })}
                    >
                      {row.status}
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className={classes.invoicePaymentWrapper}>
          <div className={classes.awaitingPaymentBox}>
            <AwaitingPaymentBox
              paymentAmount={3105.9}
              invoiceNumber={123456}
              dueDate="Aug 1"
            />
          </div>
          <div className={classes.noPendingInvoicesBox}>
            <NoPendingInvoicesBox />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const AwaitingPaymentBox: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.invoicePaymentWrapper}>
        <div className={classes.boxHeader}>Awaiting Payment</div>
        <div className={classes.boxMiddle}>
          ${props.paymentAmount.toFixed(2)}
        </div>
        <div className={classes.boxFooter}>
          Invoice #{props.invoiceNumber} due {props.dueDate}
        </div>
      </div>
    </React.Fragment>
  );
};

const NoPendingInvoicesBox: React.FC = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.invoicePaymentWrapper}>
        <div className={classes.boxHeader}>No pending invoices</div>
        <div className={classes.boxMiddle}>Thank you!</div>
        <div className={classes.boxFooter}>
          It&apos;s our pleasure to serve you
        </div>
      </div>
    </React.Fragment>
  );
};

type Props = {
  paymentAmount: number;
  invoiceNumber?: number;
  dueDate?: string;
};

const StyledHeaderTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      border: `1px solid ${theme.customColors.sectionBorder}`,
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderTop: `1px solid ${theme.customColors.sectionBorder}`,
      borderBottom: `1px solid ${theme.customColors.sectionBorder}`,
      "&:nth-of-type(even)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: "#FFFFFF",
    display: "block",
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    margin: "40px 20px 0px 20px",
  },
  header: {
    fontSize: "24px",
    lineHeight: "36px",
    margin: "20px 0px 0px 20px",
  },
  invoicesTable: {
    margin: "20px 20px 20px 20px",
    display: "inlineBlock",
  },
  firstRow: {
    backgroundColor: "#F5F5F5",
    padding: "10px 15px 10px 15px",
    border: "1px solid #E5E5E5",
  },
  evenRow: {
    backgroundColor: "#F8F8F8",
    padding: "15px",
  },
  oddRow: {
    backgroundColor: "#FFFFFF",
    padding: "15px",
  },
  firstRowItem: {
    fontWeight: "bold",
    display: "inline",
  },
  rowItem: {
    display: "inline",
  },
  link: {
    color: "#FF5555",
    textDecoration: "underline",
    display: "inline",
  },
  reactLink: {
    color: "#FF5555",
    textDecoration: "underline",
  },
  paidCell: {
    align: "right",
  },
  dueItem: {
    color: "#E53935",
    fontWeight: "bold",
    display: "inline",
  },
  paidItem: {
    color: "#08B44F",
    display: "inline",
  },
  divider: {
    border: "1px solid #E5E5E5",
  },
  invoicePaymentWrapper: {
    width: "251px",
    margin: "20px",
  },
  awaitingPaymentBox: {
    backgroundColor: "#FFE3E3",
    border: "1px solid #FFBAB9",
    borderRadius: "4px",
    padding: "10px",
    marginTop: "20px",
  },
  noPendingInvoicesBox: {
    backgroundColor: "#D1E0D8",
    border: "1px solid #4CC17C",
    borderRadius: "4px",
    padding: "10px",
    marginTop: "20px",
  },
  boxHeader: {
    fontWeight: "bold",
    fontSize: "14px",
    lineHeight: "22px",
  },
  boxMiddle: {
    fontWeight: "bold",
    fontSize: "32px",
    lineHeight: "40px",
  },
  boxFooter: {
    fontSize: "14px",
    lineHeight: "22px",
    marginTop: "5px",
  },
  table: {
    borderRadius: "4px",
    margin: "20px",
  },
}));
