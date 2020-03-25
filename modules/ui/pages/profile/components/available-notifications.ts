import { NotificationReason } from "graphql/server-types.gen";

const notificationsMap = [
  {
    id: NotificationReason.AbsenceApproved,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.AbsenceCancelled,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.AbsenceCreated,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.AbsenceNeedsApproval,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.AssignmentsNeedVerified,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.JobAvailable,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.JobCancelled,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.JobDetailsChanged,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.JobFilled,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.SubAssigned,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.SubCancelled,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.SubRemoved,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
  {
    id: NotificationReason.UnfilledToday,
    receiveEmailNotifications: false,
    receiveSmsNotifications: false,
    receiveInAppNotifications: false,
  },
];

export const showPreference = (
  id: NotificationReason,
  notificationType?: string
) => {
  const notificationPreference: any = notificationsMap.find(x => x.id === id);

  if (Config.isDevFeatureOnly) return true;

  return notificationType
    ? notificationPreference[notificationType]
    : notificationPreference.receiveEmailNotifications ||
        notificationPreference.receiveInAppNotifications ||
        notificationPreference.receiveSmsNotifications;
};

export const showInApp = () => {
  if (Config.isDevFeatureOnly) return true;

  return notificationsMap.some(x => x.receiveInAppNotifications);
};

export const showAny = () => {
  if (Config.isDevFeatureOnly) return true;

  return notificationsMap.some(
    x =>
      x.receiveEmailNotifications ||
      x.receiveInAppNotifications ||
      x.receiveSmsNotifications
  );
};
