import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useIsMobile } from "hooks";
import {
  UserPreferencesInput,
  NotificationPreferenceInput,
} from "graphql/server-types.gen";
import { PreferenceRow } from "./preference-row";
import { Formik } from "formik";
import { showInApp, showAny } from "./available-notifications";

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

  const showReasons = showAny();

  // If the user can't see any rows because we have hidden all the reasons, don't show the reasons
  if (preferences.notificationPreferences.length === 0 || !showReasons) {
    return <></>;
  }

  const showInAppColumn = showInApp();

  return (
    <>
      <Section>
        <SectionHeader title={t("Notification Preferences")} />
        <Grid
          container
          item
          xs={isMobile ? 12 : 6}
          spacing={1}
          className={classes.headerRow}
        >
          <Grid item xs={6}>
            <div className={classes.headerText}>{t("Notification reason")}</div>
          </Grid>
          <Grid item xs={showInAppColumn ? 2 : 3}>
            <div className={classes.headerText}>{t("Email")}</div>
          </Grid>
          <Grid item xs={showInAppColumn ? 2 : 3}>
            <div className={classes.headerText}>{t("Sms")}</div>
          </Grid>
          {showInAppColumn && (
            <Grid item xs={2}>
              <div className={classes.headerText}>{t("In app")}</div>
            </Grid>
          )}
        </Grid>
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
              {values.notificationPreferences.map((p, i) => {
                if (p) {
                  return (
                    <PreferenceRow
                      key={i}
                      notificationPreference={p}
                      onSubmit={submitForm}
                      shadeRow={i % 2 == 1}
                      setFieldValue={setFieldValue}
                      index={i}
                    />
                  );
                }
              })}
            </form>
          )}
        </Formik>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  headerRow: {
    background: theme.customColors.lightGray,
    border: `1px solid ${theme.customColors.lightGray}`,
  },
  headerText: {
    fontStyle: "bold",
  },
}));
