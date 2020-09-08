import * as React from "react";
import { makeStyles, Checkbox, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "hooks";
import {
  NotificationPreferenceInput,
  NotificationMethod,
  DefaultNotificationStatus,
} from "graphql/server-types.gen";
import clsx from "clsx";
import { useNotificationReasons } from "reference-data/notification-reasons";

type Props = {
  notificationPreference: NotificationPreferenceInput;
  setFieldValue: Function;
  shadeRow: boolean;
  index: number;
  showEmailColumn: boolean;
  showSmsColumn: boolean;
  showInAppColumn: boolean;
};

export const PreferenceRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const preference = props.notificationPreference;
  const { showEmailColumn, showInAppColumn, showSmsColumn } = props;

  const notificationReasons = useNotificationReasons();
  const notificationReason = notificationReasons.find(
    x => x.enumValue === preference.notificationReasonId
  );

  // If this reason is not found, it means we haven't implemented it yet
  if (!notificationReason) {
    return <></>;
  }

  return (
    <>
      <Grid
        container
        spacing={1}
        item
        xs={12}
        alignItems="center"
        className={clsx({
          [classes.shadedRow]: props.shadeRow,
        })}
      >
        <Grid item xs={6}>
          {notificationReason?.description}
        </Grid>
        {showEmailColumn && (
          <Grid item xs={1}>
            {notificationReason.methodsOfDelivery.find(
              x => x.method === NotificationMethod.Email
            ) && (
              <Checkbox
                color="primary"
                checked={preference.receiveEmailNotifications ?? false}
                onChange={async e => {
                  props.setFieldValue(
                    `notificationPreferences[${props.index}].receiveEmailNotifications`,
                    e.target.checked
                  );
                }}
                disabled={
                  notificationReason.methodsOfDelivery.find(
                    x => x.method === NotificationMethod.Email
                  )?.default === DefaultNotificationStatus.AlwaysOn
                }
              />
            )}
          </Grid>
        )}
        {showSmsColumn && (
          <Grid item xs={1}>
            {notificationReason.methodsOfDelivery.find(
              x => x.method === NotificationMethod.Sms
            ) && (
              <Checkbox
                color="primary"
                checked={preference.receiveSmsNotifications ?? false}
                onChange={async e => {
                  props.setFieldValue(
                    `notificationPreferences[${props.index}].receiveSmsNotifications`,
                    e.target.checked
                  );
                }}
                disabled={
                  notificationReason.methodsOfDelivery.find(
                    x => x.method === NotificationMethod.Sms
                  )?.default === DefaultNotificationStatus.AlwaysOn
                }
              />
            )}
          </Grid>
        )}
        {showInAppColumn && (
          <Grid item xs={1}>
            {notificationReason.methodsOfDelivery.find(
              x => x.method === NotificationMethod.InApp
            ) && (
              <Checkbox
                color="primary"
                checked={preference.receiveInAppNotifications ?? false}
                onChange={async e => {
                  props.setFieldValue(
                    `notificationPreferences[${props.index}].receiveInAppNotifications`,
                    e.target.checked
                  );
                }}
                disabled={
                  notificationReason.methodsOfDelivery.find(
                    x => x.method === NotificationMethod.InApp
                  )?.default === DefaultNotificationStatus.AlwaysOn
                }
              />
            )}
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
  },
  checkBox: {
    padding: theme.spacing(2),
  },
}));
