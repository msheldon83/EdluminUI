import * as React from "react";
import { makeStyles } from "@material-ui/styles";

export const CRMSubscription = () => {
  const classes = useStyles();

  return (
    /*<React.Fragment>
      <div className={classes.container}>
        <div className={classes.header}>Subscription for 2020-21</div>
        <table className={classes.subscriptionTable}>
          <thead className={classes.evenRow}>
            <td className={classes.columnName}>Item</td>
            <td className={classes.columnName}>Rate</td>
            <td className={classes.columnName}>Qty</td>
            <td className={classes.columnName}>In use</td>
            <td className={classes.columnName}>Total /mo</td>
          </thead>
          <tbody>
            <tr className={classes.oddRow}>
              <td>Employees requiring a substitute</td>
              <td>$1.53/mo</td>
              <td>203</td>
              <td>200 (-3)</td>
              <td>$310.59</td>
            </tr>
            <tr className={classes.evenRow}>
              <td>Employees not requiring a substitute</td>
              <td>$0.73/mo</td>
              <td>0</td>
              <td>5 (+5)</td>
              <td>$0.00</td>
            </tr>
            <tr className={classes.oddRow}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>$310.59</td>
            </tr>
          </tbody>
        </table>
      </div>
    </React.Fragment>*/

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
          <div className={classes.subscriptionCost}>
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
    margin: "20px 20px 20px 20px",
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
    margin: "0px 20px 0px 20px",
  },
  subscriptionCost: {
    backgroundColor: "#D8DCF7",
    border: "1px solid #6471DF",
    borderRadius: "4px",
    width: "223px",
    padding: "10px",
    display: "inlineBlock",
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
    width: "223px",
    paddingLeft: "5px",
    marginTop: "10px",
    fontSize: "14px",
    lineHeight: "22px",
  },
}));
