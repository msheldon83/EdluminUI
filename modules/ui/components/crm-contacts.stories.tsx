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
          <div className={classes.infoLine}>Mary Smith</div>
          <div className={classes.infoLine}>Director of HR</div>
          <div className={classes.infoLine}>msmith@reallycoolschools.edu</div>
          <div className={classes.infoLine}>(610) 555-1212</div>
          <div className={classes.textLink}>Edit</div>
        </div>
        <div className={classes.contactSubfield}>
          <div className={classes.title}>Billing contact</div>
          <div className={classes.infoLine}>John Kappadicco</div>
          <div className={classes.infoLine}>Accounts Payable</div>
          <div className={classes.infoLine}>
            jkappadicco@reallycoolschools.edu
          </div>
          <div className={classes.infoLine}>(610) 555-1212</div>
          <div className={classes.textLink}>Edit</div>
          <div className={classes.textLink}>Invite to login</div>
        </div>
        <div className={classes.contactSubfield}>
          <div className={classes.title}>Billing address</div>
          <div className={classes.infoLine}>1265 E Notting Drive</div>
          <div className={classes.infoLine}>Exton, PA 19341</div>
          <div className={classes.textLink}>Edit</div>
        </div>
      </div>
    </React.Fragment>
  );
};

export const CRMContactsReact: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.contacts}>
        <div className={classes.header}>Contacts</div>
        <ContactSubfield
          title="Primary business contact"
          name="Mary Smith"
          role="Director of HR"
          email="msmith@reallycoolschools.edu"
          phone="(610) 555-1212"
        >
          <TextLink linkName="Edit" />
        </ContactSubfield>
        <ContactSubfield
          title="Billing contact"
          name="John Kappadicco"
          role="Accounts Payable"
          email="jkappadicco@reallycoolschools.edu"
          phone="(610) 555-1212"
        >
          <TextLink linkName="Edit" />
          <TextLink linkName="Invite to login" />
        </ContactSubfield>
        <ContactSubfield
          title="Billing address"
          addressLine1="1265 E Notting Drive"
          addressLine2="Exton, PA 19341"
        >
          <TextLink linkName="Edit" />
        </ContactSubfield>
      </div>
    </React.Fragment>
  );
};

const ContactSubfield: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.contactSubfield}>
        <div className={classes.title}>{props.title}</div>
        <div className={classes.infoLine}>{props.name}</div>
        <div className={classes.infoLine}>{props.role}</div>
        <div className={classes.infoLine}>{props.email}</div>
        <div className={classes.infoLine}>{props.phone}</div>
        <div className={classes.infoLine}>{props.addressLine1}</div>
        <div className={classes.infoLine}>{props.addressLine2}</div>
        <div className={classes.infoLine}>{props.children}</div>
      </div>
    </React.Fragment>
  );
};

const TextLink: React.FC<Props> = props => {
  const classes = useStyles();

  return <div className={classes.textLink}>{props.linkName}</div>;
};

type Props = {
  title?: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  linkName?: string;
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
    margin: "20px 0px 0px 20px",
  },
  contactSubfield: {
    display: "inline-block",
    margin: "20px 100px 10px 20px",
    verticalAlign: "top",
  },
  title: {
    fontWeight: "bold",
  },
  infoLine: {
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
