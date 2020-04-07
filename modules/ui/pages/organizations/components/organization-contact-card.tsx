import * as React from "react";
import { Grid } from "@material-ui/core";
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

export const OrganizationContactCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const showLabels = props.isEmployee && props.isReplacementEmployee;

  const sameContactInfo =
    props.employeeContact?.name === props.subContact?.name &&
    props.employeeContact?.email === props.subContact?.email &&
    props.employeeContact?.phone === props.subContact?.phone;

  const employeeContactNotComplete =
    (!props.employeeContact?.name || props.employeeContact?.name === "") &&
    (!props.employeeContact?.email || props.employeeContact?.email === "") &&
    (!props.employeeContact?.phone || props.employeeContact.phone === "");

  const subContactNotComplete =
    (!props.subContact?.name || props.subContact?.name === "") &&
    (!props.subContact?.email || props.subContact?.email === "") &&
    (!props.subContact?.phone || props.subContact.phone === "");

  const blankContactInfo = sameContactInfo && employeeContactNotComplete;

  const showEmployee =
    (props.isEmployee && !employeeContactNotComplete) ?? false;
  const showSub =
    (props.isReplacementEmployee && !subContactNotComplete) ?? false;

  return (
    <>
      <Typography variant="h5">{props.organizationName}</Typography>
      <Grid container item xs={12} spacing={3}>
        {sameContactInfo && !blankContactInfo ? (
          <Grid item xs={isMobile ? 12 : 3}>
            <div>{props.employeeContact?.name}</div>
            <div>{props.employeeContact?.phone}</div>
            <div>
              <a href={"mailto:" + props.employeeContact?.email}>
                {props.employeeContact?.email}
              </a>
            </div>
          </Grid>
        ) : (
          <>
            {showEmployee && (
              <Grid item xs={isMobile ? 12 : 3}>
                {showLabels && showSub && (
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
                {showLabels && showEmployee && (
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
            {blankContactInfo && (
              <Grid item xs={isMobile ? 12 : 3}>
                <div className={classes.header}>
                  <i> {t("No Contact Specified")}</i>
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
