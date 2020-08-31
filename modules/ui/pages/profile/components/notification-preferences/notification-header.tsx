import * as React from "react";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  showEmailColumn: boolean;
  showSmsColumn: boolean;
  showInAppColumn: boolean;
  roleLabel?: string | null;
};

export const NotificationGroupHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div>
      {props.roleLabel && (
        <Typography variant="h5" className={classes.roleLabel}>
          {props.roleLabel}
        </Typography>
      )}
      <Grid
        container
        spacing={1}
        item
        xs={12}
        alignItems="center"
        className={classes.headerRow}
      >
        <Grid item xs={6}>
          <div className={classes.headerText}>{t("Notification reason")}</div>
        </Grid>
        {props.showEmailColumn && (
          <Grid item xs={1}>
            <div className={classes.headerText}>{t("Email")}</div>
          </Grid>
        )}
        {props.showSmsColumn && (
          <Grid item xs={1}>
            <div className={classes.headerText}>{t("Mobile")}</div>
          </Grid>
        )}
        {props.showInAppColumn && (
          <Grid item xs={3}>
            <div className={classes.headerText}>{t("In app")}</div>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  headerRow: {
    background: theme.customColors.lightGray,
    border: `1px solid ${theme.customColors.lightGray}`,
  },
  headerText: {
    fontWeight: 500,
  },
  roleLabel: {
    paddingBottom: theme.spacing(1),
  },
}));
