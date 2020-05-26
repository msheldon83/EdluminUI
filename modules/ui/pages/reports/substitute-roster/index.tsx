import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  ReportDefinitionInput,
  Direction,
  ExpressionFunction,
} from "ui/components/reporting/types";
import { ShadowIndicator } from "ui/components/shadow-indicator";

export const SubstituteRosterReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  const reportInput: ReportDefinitionInput = React.useMemo(() => {
    return {
      from: "Substitute",
      select: [
        {
          expression: "Concat(LastName,', ',FirstName) AS Substitute",
          component: (row: any[]) => {
            return (
              <div>
                <div>{row[0]}</div>
                <ShadowIndicator orgName={row[1]} isShadow={!!row[1]} />
              </div>
            );
          },
          width: 300,
        },
        { expression: "ShadowOrgName", hiddenFromReport: true },
        { expression: "ExternalId" },
        { expression: "Active" },
        { expression: "InvitationStatus" },
        { expression: "Endorsements" },
        { expression: "HasEndorsements" },
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
      title={t("Substitute Roster")}
      input={reportInput}
      exportFilename={t("SubstituteRosterReport")}
      filterFieldsOverride={[
        "Active",
        "InvitationStatus",
        "EndorsementId",
        "HasEndorsements",
        "SourceOrgId",
      ]}
    />
  );
};
