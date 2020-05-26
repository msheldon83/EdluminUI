import * as React from "react";
import { makeStyles } from "@material-ui/styles";

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
            <div className={classes.linkItem} style={{ marginRight: "110px" }}>
              123943
            </div>
            <div className={classes.linkItem} style={{ marginRight: "156px" }}>
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
            <div className={classes.linkItem} style={{ marginRight: "102px" }}>
              1239123
            </div>
            <div className={classes.rowItem} style={{ marginRight: "10px" }}>
              1239
            </div>
            <div className={classes.linkItem} style={{ marginRight: "115px" }}>
              Edit
            </div>
            <div className={classes.rowItem}>$3105.90</div>
            <div className={classes.paidItem} style={{ float: "right" }}>
              Paid
            </div>
          </div>
          <div className={classes.divider}></div>
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
  linkItem: {
    color: "#FF5555",
    textDecoration: "underline",
    display: "inline",
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
}));
