import * as React from "react";
import { makeStyles } from "@material-ui/styles";

export const CRMStory = () => {
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
          <div className={classes.edit}>Edit</div>
        </div>
        <div className={classes.contactSubfield}>
          <div className={classes.title}>Billing contact</div>
          <div className={classes.name}>John Kappadicco</div>
          <div className={classes.role}>Accounts Payable</div>
          <div className={classes.email}>jkappadicco@reallycoolschools.edu</div>
          <div className={classes.phone}>(610) 555-1212</div>
          <div className={classes.edit}>Edit</div>
          <div className={classes.invite}>Invite to login</div>
        </div>
        <div className={classes.contactSubfield}>
          <div className={classes.title}>Billing address</div>
          <div className={classes.addressLine}>1265 E Notting Drive</div>
          <div className={classes.addressLine}>Exton, PA 19341</div>
          <div className={classes.edit}>Edit</div>
        </div>
      </div>
    </React.Fragment>
  );
};

const useStyles = makeStyles(theme => ({
  contacts: {
    display: "block",
    margin: "40px 20px 0px 20px",
    border: "1px solid black",
  },
  header: {
    fontSize: "24px",
    lineHeight: "36px",
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
    padding: "5px",
  },
  role: {
    padding: "5px",
  },
  email: {
    padding: "5px",
  },
  phone: {
    padding: "5px",
  },
  addressLine: {
    padding: "5px",
  },
  edit: {
    color: "#FF5555",
    textDecoration: "underline",
    textDecorationColor: "#FF5555",
    display: "inline-block",
    marginRight: "30px",
  },
  invite: {
    color: "#FF5555",
    textDecoration: "underline",
    textDecorationColor: "#FF5555",
    display: "inline-block",
  },
}));
