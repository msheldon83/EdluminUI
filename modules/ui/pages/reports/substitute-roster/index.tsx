import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";

export const SubstituteRosterReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  return (
    <Report
      title={t("Substitute Roster")}
      rdl={
        "QUERY FROM Substitute WHERE (Active = '1') SELECT Concat(LastName, ', ', FirstName) AS Substitute, ShadowOrgName, ExternalId, Active, InvitationStatus, Endorsements, HasEndorsements, Email, LoginEmail ORDER BY Concat(LastName, ', ', FirstName) ASC"
      }
      exportFilename={t("SubstituteRosterReport")}
      allowedFilterFieldsOverride={[
        "Active",
        "InvitationStatus",
        "EndorsementId",
        "HasEndorsements",
        "SourceOrgId",
      ]}
    />
  );
};
