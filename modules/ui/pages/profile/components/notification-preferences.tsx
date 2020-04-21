import * as React from "react";
import { useMemo } from "react";
import { makeStyles, Divider } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useIsMobile } from "hooks";
import {
  UserPreferencesInput,
  NotificationPreferenceInput,
  NotificationMethod,
} from "graphql/server-types.gen";
import { Formik } from "formik";
import { useNotificationReasons } from "reference-data/notification-reasons";
import {
  groupNotificationPreferencesByRole,
  GroupedNotificationPreferences,
} from "./notification-preferences/preference-helper";
import { NotificationGroup } from "./notification-preferences/notification-preference-group";
import { getDisplayName } from "ui/components/enumHelpers";

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
  const userNotificationReasons = allNotificationReasons.filter(v => {
    if (v?.enumValue) return userNotificationReasonIds.includes(v.enumValue);
  });

  const showEmailColumn = userNotificationReasons.some(x =>
    x.methodsOfDelivery.find(y => y.method === NotificationMethod.Email)
  );
  const showSmsColumn = userNotificationReasons.some(x =>
    x.methodsOfDelivery.find(
      y =>
        y.method === NotificationMethod.Sms ||
        y.method === NotificationMethod.Push
    )
  );
  const showInAppColumn = userNotificationReasons.some(x =>
    x.methodsOfDelivery.find(y => y.method === NotificationMethod.InApp)
  );

  if (!userNotificationReasons || userNotificationReasons.length < 1) {
    return <></>;
  }

  const multipleRoles =
    new Set(userNotificationReasons.map(x => x.appliesToRole)).size > 1;

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
              {groupNotificationPreferencesByRole(
                values.notificationPreferences,
                userNotificationReasons
              ).map((gnp: GroupedNotificationPreferences, i) => {
                return (
                  <>
                    <NotificationGroup
                      key={i}
                      showEmailColumn={showEmailColumn}
                      showSmsColumn={showSmsColumn}
                      showInAppColumn={showInAppColumn}
                      onSubmit={submitForm}
                      role={
                        multipleRoles
                          ? getDisplayName("orgUserRole", gnp.role, t)
                          : undefined
                      }
                      setFieldValue={setFieldValue}
                      notificationPreferences={gnp.preferences}
                    />
                  </>
                );
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
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
