import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  saveRdlToLocalStorage,
  getRdlFromLocalStorage,
} from "ui/components/reporting/helpers";
import { useOrganizationId } from "core/org-context";

export const EmployeeRosterReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const orgId = useOrganizationId();

  // TODO: Once we have Saved Views, the need for this localStorage piece
  // goes away. The localStorageKey has the Date in it on the off chance
  // we need to come into here and modify the canned report RDL prior to
  // implementing Saved Views and want to make sure all Users default back
  // to the RDL that we define the next time they visit this report.
  const localStorageKey = React.useMemo(
    () => `EmployeeRosterReport_20200626_${orgId}`,
    [orgId]
  );
  const rdl = React.useMemo(() => {
    const localStorageRdl = getRdlFromLocalStorage(localStorageKey);
    if (localStorageRdl) {
      return localStorageRdl;
    }

    return "QUERY FROM Employee WHERE (Active = '1') SELECT Concat(LastName,', ',FirstName) AS Employee WIDTH(250), ExternalId, Active, InvitationStatus, LocationNames, Title WIDTH(250), PositionTypeName, NeedsReplacement, Email, LoginEmail, ContractName ORDER BY Concat(LastName,', ',FirstName) ASC";
  }, [localStorageKey]);

  return (
    <Report
      title={t("Employee Roster")}
      rdl={rdl}
      exportFilename={t("EmployeeRosterReport")}
      allowedFilterFieldsOverride={[
        "LocationId",
        "PositionTypeId",
        "Active",
        "InvitationStatus",
        "NeedsReplacement"
      ]}
      saveRdl={(rdl: string) => saveRdlToLocalStorage(localStorageKey, rdl)}
    />
  );
};
