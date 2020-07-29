import * as React from "react";
import { useMemo } from "react";
import { makeStyles, Divider, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useIsMobile } from "hooks";
import {
  NotificationPreferenceInput,
  NotificationMethod,
} from "graphql/server-types.gen";
import { useNotificationReasons } from "reference-data/notification-reasons";
import {
  groupNotificationPreferencesByRole,
  GroupedNotificationPreferences,
} from "./notification-preferences/preference-helper";
import { NotificationGroup } from "./notification-preferences/notification-preference-group";
import { getDisplayName } from "ui/components/enumHelpers";

type Props = {
  notificationPreferences: NotificationPreferenceInput[];
  setFieldValue: Function;
  submitForm: () => Promise<any>;
  formDirty: boolean;
};

export const NotificationPreferences: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const { notificationPreferences } = props;

  const allNotificationReasons = useNotificationReasons();
  const userNotificationReasonIds = notificationPreferences.map(
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
      <Section>
        <SectionHeader title={t("Notification Preferences")} />
        {groupNotificationPreferencesByRole(
          notificationPreferences,
          userNotificationReasons
        ).map((gnp: GroupedNotificationPreferences, i) => {
          return (
            <NotificationGroup
              key={i}
              showEmailColumn={showEmailColumn}
              showSmsColumn={showSmsColumn}
              showInAppColumn={showInAppColumn}
              role={
                multipleRoles
                  ? getDisplayName("orgUserRole", gnp.role, t)
                  : undefined
              }
              setFieldValue={props.setFieldValue}
              notificationPreferences={gnp.preferences}
            />
          );
        })}
        <div className={classes.button}>
          <Button
            onClick={props.submitForm}
            variant="contained"
            disabled={!props.formDirty}
          >
            {t("Save")}
          </Button>
        </div>
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
    fontWeight: 500,
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  button: {
    display: "flex",
    marginTop: theme.spacing(2),
    justifyContent: "flex-end",
  },
}));
