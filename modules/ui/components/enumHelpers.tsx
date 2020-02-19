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
