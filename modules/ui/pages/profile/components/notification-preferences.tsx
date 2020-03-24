import * as React from "react";
import { useMemo } from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useIsMobile } from "hooks";
import {
  UserPreferencesInput,
  NotificationReason,
  NotificationPreferenceInput,
  OrgUserRole,
} from "graphql/server-types.gen";
import { PreferenceRow } from "./preference-row";
import { useNotificationReasons } from "reference-data/notification-reasons";
import { useIsAdmin } from "reference-data/is-admin";
import { useIsEmployee } from "reference-data/is-employee";
import { useIsSubstitute } from "reference-data/is-substitute";
import { compact } from "lodash-es";

type Props = {
  user: {
    preferences?: {
      notificationPreferences?: Array<{
        notificationReasonId: NotificationReason;
        receiveEmailNotifications: boolean;
        receiveSmsNotifications: boolean;
        receiveInAppNotifications: boolean;
      } | null> | null;
    } | null;
  };
  onUpdatePreferences: (preferences: UserPreferencesInput) => Promise<any>;
};

export const NotificationPreferences: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const isAdmin = useIsAdmin();
  const adminReasons = useNotificationReasons(OrgUserRole.Administrator);
  const isEmployee = useIsEmployee();
  const employeeReasons = useNotificationReasons(OrgUserRole.Employee);
  const isSubstitute = useIsSubstitute();
  const subReasons = useNotificationReasons(OrgUserRole.ReplacementEmployee);

  const onUpdatePreference = async (
    preference: NotificationPreferenceInput
  ) => {};

  const notificationReasonIdsForUser = useMemo(() => {
    let ids: NotificationReason[] = [];
    if (isAdmin) {
      ids = ids.concat(compact(adminReasons.map(a => a?.enumValue)));
    }
    if (isEmployee) {
      ids = ids.concat(compact(employeeReasons.map(a => a?.enumValue)));
    }
    if (isSubstitute) {
      ids = ids.concat(compact(subReasons.map(a => a?.enumValue)));
    }

    return [...new Set(ids)];
  }, [
    adminReasons,
    employeeReasons,
    isAdmin,
    isEmployee,
    isSubstitute,
    subReasons,
  ]);

  const notificationPreferences = props.user?.preferences
    ?.notificationPreferences
    ? props.user.preferences.notificationPreferences.filter(x =>
        notificationReasonIdsForUser.includes(x?.notificationReasonId)
      )
    : [];

  return (
    <>
      <Section>
        <SectionHeader title={t("Notification Preferences")} />
        <Grid container item xs={6} spacing={1} className={classes.headerRow}>
          <Grid item xs={6}>
            {t("Notification reason")}
          </Grid>
          <Grid item xs={2}>
            {t("Email")}
          </Grid>
          <Grid item xs={2}>
            {t("Sms")}
          </Grid>
          <Grid item xs={2}>
            {t("In app")}
          </Grid>
        </Grid>
        {notificationPreferences.map((p, i) => {
          return (
            <PreferenceRow
              key={i}
              notificationPreference={p}
              onUpdatePreference={onUpdatePreference}
              shadeRow={i % 2 == 1}
            />
          );
        })}
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  headerRow: {
    background: theme.customColors.lightGray,
    border: `1px solid ${theme.customColors.lightGray}`,
  },
}));
