import * as React from "react";
import { makeStyles } from "@material-ui/styles";

export const CRMContacts = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.contacts}>
        <div className={classes.header}>Contacts</div>
        <div className={classes.contactSubfield}>
          <div className={classes.title}>Primary business contact</div>
          <div className={classes.name}>Mary Smith</div>
          <div className={classes.role}>Director of HR</div>
          <div className={classes.email}>msmith@reallycoolschools.edu</div>
          <div className={classes.phone}>(610) 555-1212</div>
          <div className={classes.textLink}>Edit</div>
        </div>
        <div className={classes.contactSubfield}>
          <div className={classes.title}>Billing contact</div>
          <div className={classes.name}>John Kappadicco</div>
          <div className={classes.role}>Accounts Payable</div>
          <div className={classes.email}>jkappadicco@reallycoolschools.edu</div>
          <div className={classes.phone}>(610) 555-1212</div>
          <div className={classes.textLink}>Edit</div>
          <div className={classes.textLink}>Invite to login</div>
        </div>
        <div className={classes.contactSubfield}>
          <div className={classes.title}>Billing address</div>
          <div className={classes.addressLine}>1265 E Notting Drive</div>
          <div className={classes.addressLine}>Exton, PA 19341</div>
          <div className={classes.textLink}>Edit</div>
        </div>
      </div>
    </React.Fragment>
  );
};

const useStyles = makeStyles(theme => ({
  contacts: {
    backgroundColor: "#FFFFFF",
    display: "block",
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    margin: "40px 20px 0px 20px",
  },
  header: {
    fontSize: "24px",
    lineHeight: "36px",
    margin: "10px 0px 0px 10px",
  },
  contactSubfield: {
    display: "inline-block",
    margin: "10px",
    verticalAlign: "top",
  },
  title: {
    fontWeight: "bold",
  },
  name: {
    // padding: "5px",
    lineHeight: "22px",
  },
  role: {
    // padding: "5px",
    lineHeight: "22px",
  },
  email: {
    // padding: "5px",
    lineHeight: "22px",
  },
  phone: {
    // padding: "5px",
    lineHeight: "22px",
  },
  addressLine: {
    // padding: "5px",
    lineHeight: "22px",
  },
  textLink: {
    color: "#FF5555",
    fontSize: "14px",
    lineHeight: "22px",
    textDecoration: "underline",
    textDecorationColor: "#FF5555",
    display: "inline-block",
    marginTop: "10px",
    marginRight: "30px",
  },
}));
