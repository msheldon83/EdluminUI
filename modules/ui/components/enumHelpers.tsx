import i18next = require("i18next");
import { camelCase, upperFirst } from "lodash-es";

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
      name: "notificationMethod.IN_APP",
      displayName: t("In app"),
    },
    {
      name: "notificationMethod.EMAIL",
      displayName: t("Email"),
    },
    {
      name: "notificationMethod.SMS",
      displayName: t("Text message"),
    },
    {
      name: "notificationMethod.PUSH",
      displayName: t("Push notification"),
    },
    {
      name: "absenceReasonTrackingTypeId.HOURLY",
      displayName: t("Hourly"),
    },
    {
      name: "absenceReasonTrackingTypeId.DAILY",
      displayName: t("Daily"),
    },
    {
      name: "dataImportStatus.CREATED",
      displayName: t("Created"),
    },
    {
      name: "dataImportStatus.FILE_UPLOAD_FAILURE",
      displayName: t("File upload failure"),
    },
    {
      name: "dataImportStatus.UNSUPPORTED_DATA_LOAD_TYPE",
      displayName: t("Unsupported data load type"),
    },
    {
      name: "dataImportStatus.MISSING_COLUMN_DEFINITIONS",
      displayName: t("Missing column definitions"),
    },
    {
      name: "dataImportStatus.MISSING_COLUMN_NAMES",
      displayName: t("Missing column names"),
    },
    {
      name: "dataImportStatus.PARSING",
      displayName: t("Parsing"),
    },
    {
      name: "dataImportStatus.PARSE_FAILURE",
      displayName: t("Parse failure"),
    },
    {
      name: "dataImportStatus.READY_TO_IMPORT",
      displayName: t("Ready to import"),
    },
    {
      name: "dataImportStatus.VALIDATING",
      displayName: t("Validating"),
    },
    {
      name: "dataImportStatus.PARTIALLY_VALIDATED",
      displayName: t("Partially validated"),
    },
    {
      name: "dataImportStatus.VALIDATION_FAILURE",
      displayName: t("Validation failure"),
    },
    {
      name: "dataImportStatus.VALIDATED",
      displayName: t("Validated"),
    },
    {
      name: "dataImportStatus.QUEUED_FOR_PROCESSING",
      displayName: t("Queued for processing"),
    },
    {
      name: "dataImportStatus.IMPORTING",
      displayName: t("Importing"),
    },
    {
      name: "dataImportStatus.PARTIALLY_IMPORTED",
      displayName: t("Partially imported"),
    },
    {
      name: "dataImportStatus.IMPORT_FAILURE",
      displayName: t("Import failure"),
    },
    {
      name: "dataImportStatus.IMPORTED",
      displayName: t("Imported"),
    },
    {
      name: "dataImportStatus.PARSED",
      displayName: t("Parsed"),
    },
    {
      name: "dataImportStatus.PERMANENT_FAILURE",
      displayName: t("Permanent failure"),
    },
    {
      name: "dataImportRowStatus.CREATED",
      displayName: t("Ready to import"),
    },
    {
      name: "dataImportRowStatus.NOTHING_TO_IMPORT",
      displayName: t("Nothing to import"),
    },
    {
      name: "dataImportRowStatus.MISSING_REQUIRED_COLUMNS",
      displayName: t("Missing required columns"),
    },
    {
      name: "dataImportRowStatus.PARSE_ERROR",
      displayName: t("Parse error"),
    },
    {
      name: "dataImportRowStatus.PARSED",
      displayName: t("Parsed"),
    },
    {
      name: "dataImportRowStatus.VALIDATION_FAILURE",
      displayName: t("Validation failure"),
    },
    {
      name: "dataImportRowStatus.VALIDATED",
      displayName: t("Validated"),
    },
    {
      name: "dataImportRowStatus.IMPORT_FAILURE",
      displayName: t("Import failure"),
    },
    {
      name: "dataImportRowStatus.IMPORTED",
      displayName: t("Imported"),
    },
    {
      name: "mobileDevice.IOS",
      displayName: t("IOS"),
    },
    {
      name: "mobileDevice.ANDROID",
      displayName: t("Android"),
    },
    {
      name: "mobileDevice.INVALID",
      displayName: t("Invalid"),
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

// Converts an enum from "ABSENCE_REASON" to "AbsenceReason"
// This is useful for converting our enums from the GraphQl schema to match the serverside enums.
export const formatEnumString = (enumValue: string) => {
  return upperFirst(camelCase(enumValue));
};
