import * as React from "react";
import { makeStyles, Checkbox, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import {
  NotificationPreferenceInput,
  NotificationReason,
} from "graphql/server-types.gen";
import clsx from "clsx";
import { getDisplayName } from "ui/components/enumHelpers";

type Props = {
  notificationPreference: {
    notificationReasonId: NotificationReason;
    receiveEmailNotifications: boolean;
    receiveSmsNotifications: boolean;
    receiveInAppNotifications: boolean;
  };
  onUpdatePreference: (
    notificationPreference: NotificationPreferenceInput
  ) => Promise<any>;
  shadeRow: boolean;
};

export const PreferenceRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const preference = props.notificationPreference;
  return (
    <>
      <Grid
        container
        item
        xs={6}
        spacing={1}
        alignItems="center"
        className={clsx({
          [classes.shadedRow]: props.shadeRow,
        })}
      >
        <Grid item xs={6}>
          {getDisplayName(
            "notificationReason",
            props.notificationPreference.notificationReasonId,
            t
          )}
        </Grid>
        <Grid item xs={2}>
          <Checkbox
            color="primary"
            checked={preference.receiveEmailNotifications}
            onChange={async e => {
              preference.receiveEmailNotifications = e.target.checked;
              await props.onUpdatePreference(preference);
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Checkbox
            color="primary"
            checked={preference.receiveSmsNotifications}
            onChange={async e => {
              preference.receiveSmsNotifications = e.target.checked;
              await props.onUpdatePreference(preference);
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Checkbox
            color="primary"
            checked={preference.receiveInAppNotifications}
            onChange={async e => {
              preference.receiveInAppNotifications = e.target.checked;
              await props.onUpdatePreference(preference);
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
    border: `1px solid ${theme.customColors.lightGray}`,
  },
  checkBox: {
    padding: theme.spacing(2),
  },
}));
