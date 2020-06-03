import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";

export const EmployeeRosterReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  return (
    <Report
      title={t("Employee Roster")}
      rdl={
        "QUERY FROM Employee WHERE (Active = '1') SELECT Concat(LastName,', ',FirstName) AS Employee, ExternalId, Active, InvitationStatus, LocationNames, Title, PositionTypeName, Email, LoginEmail ORDER BY Concat(LastName,', ',FirstName) ASC"
      }
      exportFilename={t("EmployeeRosterReport")}
      allowedFilterFieldsOverride={[
        "LocationId",
        "PositionTypeId",
        "Active",
        "InvitationStatus",
      ]}
    />
  );
};
