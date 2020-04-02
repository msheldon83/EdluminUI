import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useIsMobile } from "hooks";
import {
  UserPreferencesInput,
  NotificationPreferenceInput,
  NotificationMethod,
} from "graphql/server-types.gen";
import { PreferenceRow } from "./preference-row";
import { Formik } from "formik";
import { useNotificationReasons } from "reference-data/notification-reasons";

type Props = {
  preferences: {
    notificationPreferences: NotificationPreferenceInput[];
  };
  onUpdatePreferences: (preferences: UserPreferencesInput) => Promise<any>;
};

export const NotificationPreferences: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const { preferences } = props;

  const allNotificationReasons = useNotificationReasons();
  const userNotificationReasonIds = preferences.notificationPreferences.map(
    x => x.notificationReasonId
  );

  // Check if any of the users notifications reasons have been implemented by the backend
  const userNotificationReasons = allNotificationReasons
    .filter(v => {
      if (v?.enumValue) return userNotificationReasonIds.includes(v.enumValue);
    })
    .sort((a, b) => {
      if (a.description && b.description) {
        return a?.description > b?.description ? 1 : -1;
      } else {
        return 0;
      }
    });
  if (!userNotificationReasons || userNotificationReasons.length < 1) {
    return <></>;
  }

  const showEmailColumn = userNotificationReasons.some(x =>
    x.methodsOfDelivery.find(y => y.method === NotificationMethod.Email)
  );
  const showSmsColumn = userNotificationReasons.some(x =>
    x.methodsOfDelivery.find(y => y.method === NotificationMethod.Sms)
  );
  const showInAppColumn = userNotificationReasons.some(x =>
    x.methodsOfDelivery.find(y => y.method === NotificationMethod.InApp)
  );
  const columnCount = +showEmailColumn + +showSmsColumn + +showInAppColumn;

  return (
    <>
      <Formik
        initialValues={{ ...preferences }}
        onSubmit={async data => {
          await props.onUpdatePreferences({
            notificationPreferences: data.notificationPreferences.map(x => ({
              notificationReasonId: x.notificationReasonId,
              receiveEmailNotifications: x.receiveEmailNotifications,
              receiveInAppNotifications: x.receiveInAppNotifications,
              receiveSmsNotifications: x.receiveSmsNotifications,
            })),
          });
        }}
      >
        {({ handleSubmit, submitForm, values, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <SectionHeader title={t("Notification Preferences")} />
              <Grid
                container
                spacing={1}
                item
                xs={12}
                alignItems="center"
                className={classes.headerRow}
              >
                <Grid item xs={6}>
                  <div className={classes.headerText}>
                    {t("Notification reason")}
                  </div>
                </Grid>
                {showEmailColumn && (
                  <Grid item xs={1}>
                    <div className={classes.headerText}>{t("Email")}</div>
                  </Grid>
                )}
                {showSmsColumn && (
                  <Grid item xs={1}>
                    <div className={classes.headerText}>{t("Sms")}</div>
                  </Grid>
                )}
                {showInAppColumn && (
                  <Grid item xs={1}>
                    <div className={classes.headerText}>{t("In app")}</div>
                  </Grid>
                )}
              </Grid>
              {userNotificationReasons.map((r, i) => {
                const preference = values.notificationPreferences.find(
                  x => x.notificationReasonId === r.enumValue
                );
                if (preference) {
                  return (
                    <PreferenceRow
                      key={i}
                      notificationPreference={preference}
                      onSubmit={submitForm}
                      shadeRow={i % 2 == 1}
                      setFieldValue={setFieldValue}
                      index={i}
                      showEmailColumn={showEmailColumn}
                      showSmsColumn={showSmsColumn}
                      showInAppColumn={showInAppColumn}
                    />
                  );
                }
              })}
            </Section>
          </form>
        )}
      </Formik>
    </>
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
}));
