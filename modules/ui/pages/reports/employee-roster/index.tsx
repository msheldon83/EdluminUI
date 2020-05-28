import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  ReportDefinitionInput,
  Direction,
  ExpressionFunction,
} from "ui/components/reporting/types";

export const EmployeeRosterReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  const reportInput: ReportDefinitionInput = React.useMemo(() => {
    return {
      from: "Employee",
      select: [
        { expression: "Concat(LastName,', ',FirstName)", alias: "Employee" },
        { expression: "ExternalId" },
        { expression: "Active" },
        { expression: "InvitationStatus" },
        { expression: "LocationNames" },
        { expression: "Title" },
        { expression: "PositionTypeName" },
        { expression: "Email" },
        { expression: "LoginEmail" },
      ],
      filter: [
        {
          fieldName: "Active",
          expressionFunction: ExpressionFunction.Equal,
          value: true,
        },
      ],
      orderBy: [
        {
          expression: "Concat(LastName,', ',FirstName)",
          direction: Direction.Asc,
        },
      ],
    };
  }, []);

  return (
    <Report
      title={t("Employee Roster")}
      input={reportInput}
      exportFilename={t("EmployeeRosterReport")}
      filterFieldsOverride={[
        "LocationId",
        "PositionTypeId",
        "Active",
        "InvitationStatus",
      ]}
    />
  );
};
