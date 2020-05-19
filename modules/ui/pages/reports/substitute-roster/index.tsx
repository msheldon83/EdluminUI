import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  ReportDefinitionInput,
  Direction,
  ExpressionFunction,
} from "ui/components/reporting/types";

export const SubstituteRosterReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  const reportInput: ReportDefinitionInput = React.useMemo(() => {
    return {
      from: "Substitute",
      select: [
        "Concat(LastName,', ',FirstName) AS Substitute",
        "ShadowOrgName",
        "ExternalId",
        "Active",
        "InvitationStatus",
        "Endorsements",
        "HasEndorsements",
        "Email",
        "LoginEmail",
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
      title={t("Substitute Roster")}
      input={reportInput}
      exportFilename={t("SubstituteRosterReport")}
      filterFieldsOverride={[
        "Active",
        "InvitationStatus",
        "EndorsementId",
        "HasEndorsements",
      ]}
    />
  );
};
