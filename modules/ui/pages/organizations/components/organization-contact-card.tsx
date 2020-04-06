import * as React from "react";
import { Grid, Link } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

type Props = {
  organizationName: string;
  isReplacementEmployee: boolean;
  isEmployee: boolean;
  subContact?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  employeeContact?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

type ContactInfo = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
};

export const OrganizationContactCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const [isDirty, setIsDirty] = React.useState<boolean>(false);
  const [isSame, setIsSame] = React.useState<boolean>(false);

  const [showLabels, setShowLabels] = React.useState<boolean>(
    props.isEmployee && props.isReplacementEmployee
  );

  const [contactInfo, setContactInfo] = React.useState<ContactInfo>({});

  const showEmployee =
    (props.isEmployee &&
      props.employeeContact?.name &&
      (props.employeeContact?.email || props.employeeContact?.phone)) ??
    false;

  const showSub =
    (props.isReplacementEmployee &&
      props.subContact?.name &&
      (props.subContact?.email || props.subContact?.phone)) ??
    false;

  const sameContactInfo = () => {
    if (
      props.employeeContact?.name === props.subContact?.name &&
      props.employeeContact?.email === props.subContact?.email &&
      props.employeeContact?.phone === props.subContact?.phone
    ) {
      setContactInfo({
        name: props.employeeContact?.name,
        email: props.employeeContact?.email,
        phone: props.employeeContact?.phone,
      });
      setIsSame(true);
      setShowLabels(false);
    }
  };

  const showDirtyContactInfo = () => {
    if (props.isReplacementEmployee && props.isEmployee) {
      if (
        (!props.employeeContact?.name || props.employeeContact?.name === "") &&
        (!props.employeeContact?.email ||
          props.employeeContact?.email === "" ||
          !props.employeeContact?.phone ||
          props.employeeContact.phone === "")
      ) {
        setContactInfo({
          name: props.subContact?.name,
          email: props.subContact?.email,
          phone: props.subContact?.phone,
        });
        setIsDirty(true);
        setShowLabels(false);
      } else if (
        (!props.subContact?.name || props.subContact?.name === "") &&
        (!props.subContact?.email ||
          props.subContact?.email === "" ||
          !props.subContact?.phone ||
          props.subContact.phone === "")
      ) {
        setContactInfo({
          name: props.employeeContact?.name,
          email: props.employeeContact?.email,
          phone: props.employeeContact?.phone,
        });
        setIsDirty(true);
        setShowLabels(false);
      }
    }
  };

  console.log("dirty contact:" + isSame);

  console.log("same Contact:" + isDirty);

  sameContactInfo();
  showDirtyContactInfo();

  return (
    <>
      <Typography variant="h5">{props.organizationName}</Typography>
      <Grid container item xs={12} spacing={3}>
        {isSame || isDirty ? (
          <Grid item xs={isMobile ? 12 : 3}>
            <div>{contactInfo.name}</div>
            <div>{contactInfo.phone}</div>
            <div>
              <a href={"mailto:" + contactInfo?.email}>{contactInfo?.email}</a>
            </div>
          </Grid>
        ) : (
          <>
            {showEmployee && (
              <Grid item xs={isMobile ? 12 : 3}>
                {showLabels && !isDirty && (
                  <div className={classes.header}>{t("Employee Contact")}</div>
                )}
                <div>{props.employeeContact?.name}</div>
                <div>{props.employeeContact?.phone}</div>
                <div>
                  <a href={"mailto:" + props.employeeContact?.email}>
                    {props.employeeContact?.email}
                  </a>
                </div>
              </Grid>
            )}
            {showSub && (
              <Grid item xs={isMobile ? 12 : 3}>
                {showLabels && !isDirty && (
                  <div className={classes.header}>
                    {t("Substitute Contact")}
                  </div>
                )}
                <div>{props.subContact?.name}</div>
                <div>{props.subContact?.phone}</div>
                <div>
                  <a href={"mailto:" + props.subContact?.email}>
                    {props.subContact?.email}
                  </a>
                </div>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: {
    color: theme.customColors.primary,
  },
  header: {
    color: "#9E9E9E",
    paddingTop: "10px",
  },
}));
