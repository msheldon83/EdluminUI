import { GroupedCategory } from "../types";
import { AbsenceReason, AbsenceReasonCategory } from "graphql/server-types.gen";

/*const AbsenceReasonToGroupedAbsenceReason = (
  absReason: AbsenceReason
): GroupedAbsenceReason => {
  return {
    id: absReason.id,
    name: absReason.name,
    externalId: absReason.externalId,
    isCategory: false,
    trackingType: absReason.absenceReasonTrackingTypeId,
    allowNegativeBalance: absReason.allowNegativeBalance,
    rowVersion: absReason.rowVersion,
  };
};

const AbsenceReasonCategoryToGroupedAbsenceReason = (
  absReasonCategory: AbsenceReasonCategory
): GroupedAbsenceReason => {
  return {
    id: absReasonCategory.id,
    name: absReasonCategory.name,
    externalId: absReasonCategory.externalId,
    isCategory: true,
    trackingType: absReasonCategory.absenceReasonTrackingTypeId,
    allowNegativeBalance: absReasonCategory.allowNegativeBalance,
    rowVersion: absReasonCategory.rowVersion,
  };
};*/

export const mergeCatgoriesAndReasons = (
  categories: Pick<
    AbsenceReasonCategory,
    | "id"
    | "name"
    | "rowVersion"
    | "externalId"
    | "description"
    | "code"
    | "expired"
    | "allowNegativeBalance"
  >[],
  reasons: Pick<
    AbsenceReason,
    | "id"
    | "name"
    | "rowVersion"
    | "externalId"
    | "description"
    | "code"
    | "requiresApproval"
    | "expired"
    | "isRestricted"
    | "requireNotesToAdmin"
    | "allowNegativeBalance"
    | "absenceReasonCategoryId"
  >[]
): GroupedCategory[] => {
  let mergedReasons: GroupedCategory[] = [];
  if (categories.length === 0) {
    mergedReasons.push({
      id: "0",
      name: "Uncategorized",
      rowVersion: "",
      //children: reasons.map(r => AbsenceReasonToGroupedAbsenceReason(r)),
      children: reasons,
    });
  } else {
    mergedReasons = categories.map(c => {
      const cg: GroupedCategory = {
        id: c.id,
        name: c.name,
        externalId: c.externalId,
        allowNegativeBalance: c.allowNegativeBalance,
        rowVersion: c.rowVersion,
        /*children: reasons
          .filter(r => r.absenceReasonCategoryId === c.id)
          .map(r => AbsenceReasonToGroupedAbsenceReason(r)),*/
        children: reasons.filter(r => r.absenceReasonCategoryId === c.id),
      };
      return cg;
    });
    mergedReasons.push({
      id: "0",
      name: "Uncategorized",
      rowVersion: "",
      /*children: reasons
        .filter(r => !r.absenceReasonCategoryId)
        .map(r => AbsenceReasonToGroupedAbsenceReason(r)),*/
      children: reasons.filter(r => !r.absenceReasonCategoryId),
    });
  }
  return mergedReasons;
};
