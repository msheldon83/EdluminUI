import { Attribute } from "./types";
import { isBefore, differenceInDays } from "date-fns";

export const dayWindowForWarning = 30;

export const attributeIsExpired = (
  attribute: Pick<Attribute, "expirationDate">
): boolean => {
  if (!attribute.expirationDate) {
    return false;
  }

  const result = isBefore(attribute.expirationDate, new Date());
  return result;
};

export const attributeIsCloseToExpiring = (
  attribute: Pick<Attribute, "expirationDate">,
  dayWindowForWarning: number
): boolean => {
  if (!attribute.expirationDate) {
    return false;
  }

  const result =
    differenceInDays(attribute.expirationDate, new Date()) <=
    dayWindowForWarning;
  return result;
};
