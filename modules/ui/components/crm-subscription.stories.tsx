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

export const CRMSubscription = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.container}>
        <div className={classes.header}>Subscription for 2020-21</div>
        <div className={classes.subscriptionTable}>
          <div className={classes.firstRow}>
            <div
              className={classes.firstRowItem}
              style={{ marginRight: "300px" }}
            >
              Item
            </div>
            <div
              className={classes.firstRowItem}
              style={{ marginRight: "100px" }}
            >
              Rate
            </div>
            <div
              className={classes.firstRowItem}
              style={{ marginRight: "75px" }}
            >
              Qty
            </div>
            <div className={classes.firstRowItem}>In use</div>
            <div className={classes.firstRowItem} style={{ float: "right" }}>
              Total /mo
            </div>
          </div>
          <div className={classes.oddRow}>
            <div className={classes.rowItem} style={{ marginRight: "126px" }}>
              Employees requiring a substitute
            </div>
            <div className={classes.rowItem} style={{ marginRight: "68px" }}>
              $1.53/mo
            </div>
            <div className={classes.rowItem} style={{ marginRight: "71px" }}>
              203
            </div>
            <div className={classes.rowItem}>
              200 <span style={{ color: "#4CC17B" }}>(-3)</span>
            </div>
            <div className={classes.rowItem} style={{ float: "right" }}>
              $310.59
            </div>
          </div>
          <div className={classes.divider}></div>
          <div className={classes.evenRow}>
            <div className={classes.rowItem} style={{ marginRight: "102px" }}>
              Employees not requiring a substitute
            </div>
            <div className={classes.rowItem} style={{ marginRight: "68px" }}>
              $0.73/mo
            </div>
            <div className={classes.rowItem} style={{ marginRight: "87px" }}>
              0
            </div>
            <div className={classes.rowItem}>
              5 <span style={{ color: "#C62828" }}>(+5)</span>
            </div>
            <div className={classes.rowItem} style={{ float: "right" }}>
              $0.00
            </div>
          </div>
          <div className={classes.divider}></div>
          <div className={classes.oddRow}>
            <div className={classes.rowItem}></div>
            <div className={classes.rowItem}></div>
            <div className={classes.rowItem}></div>
            <div className={classes.rowItem}></div>
            <div className={classes.lastRowItem} style={{ float: "right" }}>
              $310.59
            </div>
          </div>
        </div>
        <div className={classes.subscriptionCostWrapper}>
          <div className={classes.subscriptionCost} style={{ padding: "10px" }}>
            <div className={classes.subscriptionCostHeader}>
              2020-21 subscription cost
            </div>
            <div className={classes.totalCost}>$3105.90</div>
            <div className={classes.renewalDate}>renews July 1, 2021</div>
          </div>
          <div className={classes.disclaimer}>
            Rates shown are for listed school year and may be adjusted at time
            of renewal
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

function createData(item: any, rate: any, qty: any, inUse: any, totalMo: any) {
  return { item, rate, qty, inUse, totalMo };
}

const rows = [
  createData(
    "Employees requiring a substitute",
    "$1.53/mo",
    203,
    "200 (-3)",
    "$310.59"
  ),
  createData(
    "Employees not requiring a substitute",
    "$0.73/mo",
    0,
    "5 (+5)",
    "$0.00"
  ),
];

export const CRMSubscriptionReact = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const schoolYear = "2020-21";
  const totalCost = 310.59;

  return (
    <React.Fragment>
      <div className={classes.container}>
        <Typography variant="h5" className={classes.header}>{`${t(
          "Subscription for"
        )} ${schoolYear}`}</Typography>
        <div className={classes.table}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <StyledHeaderTableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>In use</TableCell>
                  <TableCell style={{ float: "right" }}>Total /mo</TableCell>
                </StyledHeaderTableRow>
              </TableHead>
              <TableBody>
                {rows.map(row => (
                  <StyledTableRow key={row.item}>
                    <TableCell component="th" scope="row">
                      {row.item}
                    </TableCell>
                    <TableCell>{row.rate}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.inUse}</TableCell>
                    <TableCell style={{ float: "right" }}>
                      {row.totalMo}
                    </TableCell>
                  </StyledTableRow>
                ))}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell style={{ float: "right" }}>${totalCost}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className={classes.subscriptionCostWrapper}>
          <div className={classes.subscriptionCost}>
            <CostBox
              schoolYear="2020-21"
              cost={3105.9}
              renewalDate="July 1, 2021"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const CostBox: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.subscriptionCostWrapper}>
        <div className={classes.subscriptionCostHeader}>
          {props.schoolYear} subscription cost
        </div>
        <div className={classes.totalCost}>${props.cost}</div>
        <div className={classes.renewalDate}>renews {props.renewalDate}</div>
      </div>
    </React.Fragment>
  );
};

type Props = {
  schoolYear: string;
  cost: number;
  renewalDate: string;
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

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      color: `${theme.palette.secondary.main} !important`,
      fontSize: 14,
      fontWeight: "bold",
      paddingTop: 0,
    },
    body: {
      color: `${theme.palette.secondary.main} !important`,
    },
  })
)(TableCell);

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
  subscriptionTable: {
    margin: "20px",
    display: "inlineBlock",
  },
  columnName: {
    fontWeight: "bold",
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
    color: "#000000",
    fontWeight: "bold",
    display: "inline",
  },
  rowItem: {
    display: "inline",
  },
  lastRowItem: {
    fontWeight: "bold",
    display: "inline",
  },
  divider: {
    border: "1px solid #E5E5E5",
  },
  subscriptionCostWrapper: {
    margin: "20px",
    width: "251px",
  },
  subscriptionCost: {
    backgroundColor: "#D8DCF7",
    border: "1px solid #6471DF",
    borderRadius: "4px",
  },
  subscriptionCostHeader: {
    fontWeight: "bold",
    fontSize: "14px",
    lineHeight: "22px",
  },
  totalCost: {
    fontWeight: "bold",
    fontSize: "32px",
    lineHeight: "40px",
  },
  renewalDate: {
    fontSize: "14px",
    lineHeight: "22px",
    marginTop: "5px",
  },
  disclaimer: {
    paddingLeft: "5px",
    marginTop: "10px",
    fontSize: "14px",
    lineHeight: "22px",
  },
  table: {
    borderRadius: "4px",
    margin: "20px",
  },
}));
