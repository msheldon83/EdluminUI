import * as yup from "yup";
import { DayPart } from "graphql/server-types.gen";
import { TFunction } from "i18next";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import {
  mapAccountingCodeValueToAccountingCodeAllocations,
  validateAccountingCodeAllocations,
} from "helpers/accounting-code-allocations";

export const AbsenceFormValidationSchema = (t: TFunction) => {
  return yup.object().shape({
    details: yup.array().of(
      yup.object().shape({
        absenceReasonId: yup
          .string()
          .nullable()
          .required(t("Required")),
        dayPart: yup
          .string()
          .nullable()
          .required(t("Required")),
        hourlyStartTime: yup.string().when("dayPart", {
          is: DayPart.Hourly,
          then: yup.string().required(t("Required")),
        }),
        hourlyEndTime: yup.string().when("dayPart", {
          is: DayPart.Hourly,
          then: yup.string().required(t("Required")),
        }),
      })
    ),
    notesToApprover: yup.string().when("requireNotesToApprover", {
      is: true,
      then: yup.string().required(t("Required")),
    }),
    accountingCodeAllocations: yup.object().test({
      name: "accountingCodeAllocationsCheck",
      test: function test(value: AccountingCodeValue) {
        const accountingCodeAllocations = mapAccountingCodeValueToAccountingCodeAllocations(
          value
        );

        const error = validateAccountingCodeAllocations(
          accountingCodeAllocations ?? [],
          t
        );
        if (!error) {
          return true;
        }

        return new yup.ValidationError(error, null, this.path);
      },
    }),
  });
};
