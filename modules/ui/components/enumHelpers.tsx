import i18next = require("i18next");

type EnumDefinition = {
  name: string;
  displayName: string;
};

const buildEnumMap = (t: i18next.TFunction) => {
  const enumMap: Array<EnumDefinition> = [
    { name: "needsReplacement.YES", displayName: t("Yes") },
    { name: "needsReplacement.NO", displayName: t("No") },
    {
      name: "needsReplacement.SOMETIMES",
      displayName: t("Employee should specify"),
    },
    { name: "dayPart.FULL_DAY", displayName: t("Full Day") },
    { name: "dayPart.HOURLY", displayName: t("Hourly") },
    { name: "dayPart.HALF_DAY_MORNING", displayName: t("Half Day") },
    { name: "dayPart.HALF_DAY_AFTERNOON", displayName: t("Half Day") },
    {
      name: "dayPart.QUARTER_DAY_EARLY_MORNING",
      displayName: t("Quarter Day"),
    },
    { name: "dayPart.QUARTER_DAY_LATE_MORNING", displayName: t("Quarter Day") },
    {
      name: "dayPart.QUARTER_DAY_EARLY_AFTERNOON",
      displayName: t("Quarter Day"),
    },
    {
      name: "dayPart.QUARTER_DAY_LATE_AFTERNOON",
      displayName: t("Quarter Day"),
    },
    {
      name: "payTypeId.HOURLY",
      displayName: t("Hourly"),
    },
    {
      name: "payTypeId.DAILY",
      displayName: t("Daily"),
    },
    {
      name: "orgUserRole.ADMINISTRATOR",
      displayName: t("Admin"),
    },
    {
      name: "orgUserRole.EMPLOYEE",
      displayName: t("Employee"),
    },
    {
      name: "orgUserRole.REPLACEMENT_EMPLOYEE",
      displayName: t("Substitute"),
    },
    {
      name: "dayOfWeek.SUNDAY",
      displayName: t("Sunday"),
    },
    {
      name: "dayOfWeek.MONDAY",
      displayName: t("Monday"),
    },
    {
      name: "dayOfWeek.TUESDAY",
      displayName: t("Tuesday"),
    },
    {
      name: "dayOfWeek.WEDNESDAY",
      displayName: t("Wednesday"),
    },
    {
      name: "dayOfWeek.THURSDAY",
      displayName: t("Thursday"),
    },
    {
      name: "dayOfWeek.FRIDAY",
      displayName: t("Friday"),
    },
    {
      name: "dayOfWeek.SATURDAY",
      displayName: t("Saturday"),
    },
    {
      name: "dayOfWeekShort.SUNDAY",
      displayName: t("Sun"),
    },
    {
      name: "dayOfWeekShort.MONDAY",
      displayName: t("Mon"),
    },
    {
      name: "dayOfWeekShort.TUESDAY",
      displayName: t("Tue"),
    },
    {
      name: "dayOfWeekShort.WEDNESDAY",
      displayName: t("Wed"),
    },
    {
      name: "dayOfWeekShort.THURSDAY",
      displayName: t("Thu"),
    },
    {
      name: "dayOfWeekShort.FRIDAY",
      displayName: t("Fri"),
    },
    {
      name: "dayOfWeekShort.SATURDAY",
      displayName: t("Sat"),
    },
    {
      name: "userAvailability.AVAILABLE",
      displayName: t("Any time"),
    },
    {
      name: "userAvailability.NOT_AVAILABLE",
      displayName: t("Not available"),
    },
    {
      name: "userAvailability.BEFORE",
      displayName: t("Before"),
    },
    {
      name: "userAvailability.AFTER",
      displayName: t("After"),
    },
    {
      name: "notificationMessageStatus.WAITING_TO_SEND",
      displayName: t("Waiting to send"),
    },
    {
      name: "notificationMessageStatus.SENT_TO_PROVIDER",
      displayName: t("Sent to provider"),
    },
    {
      name: "notificationMessageStatus.SEND_FAILURE",
      displayName: t("Send failure"),
    },
    {
      name: "notificationMessageStatus.DELIVERED_TO_RECIPIENT",
      displayName: t("Delivered"),
    },
    {
      name: "notificationMessageStatus.DELIVERY_FAILURE",
      displayName: t("Delivery failure"),
    },
    {
      name: "notificationMessageStatus.NOTHING_TO_SEND",
      displayName: t("Nothing to send"),
    },
    {
      name: "jobNotificationResponse.ACCEPTED",
      displayName: t("Accepted"),
    },
    {
      name: "jobNotificationResponse.REJECTED",
      displayName: t("Rejected"),
    },
    {
      name: "jobNotificationResponse.IGNORED",
      displayName: t("Ignored"),
    },
    {
      name: "notificationReason.JOB_AVAILABLE",
      displayName: t("Assignment available"),
    },
    {
      name: "notificationReason.JOB_CANCELLED",
      displayName: t("Assignment cancelled"),
    },
    {
      name: "notificationReason.JOB_DETAILS_CHANGED",
      displayName: t("Assignment updated"),
    },
    {
      name: "notificationReason.JOB_FILLED",
      displayName: t("Assignment filled"),
    },
    {
      name: "notificationReason.ABSENCE_CREATED",
      displayName: t("Absence created"),
    },
    {
      name: "notificationReason.ABSENCE_APPROVED",
      displayName: t("Absence approved"),
    },
    {
      name: "notificationReason.ABSENCE_CANCELLED",
      displayName: t("Absence cancelled"),
    },
    {
      name: "notificationReason.ABSENCE_NEEDS_APPROVAL",
      displayName: t("Absence awaiting approval"),
    },
    {
      name: "notificationReason.ASSIGNMENTS_NEED_VERIFIED",
      displayName: t("Assignments awaiting verification"),
    },
    {
      name: "notificationReason.UNFILLED_TODAY",
      displayName: t("Absences today"),
    },
    {
      name: "notificationReason.SUB_ASSIGNED",
      displayName: t("Substitute assigned"),
    },
    {
      name: "notificationReason.SUB_CANCELLED",
      displayName: t("Substitute cancelled"),
    },
    {
      name: "notificationReason.SUB_REMOVED",
      displayName: t("Substitute removed"),
    },
  ];
  return enumMap;
};

export const getDisplayName = (
  propertyName: string,
  enumValue: string,
  t: i18next.TFunction
) => {
  const enumMap = buildEnumMap(t);
  const enumKey = `${propertyName}.${enumValue}`;
  const match = enumMap.find(e => e.name === enumKey);
  return match ? match.displayName : null;
};
