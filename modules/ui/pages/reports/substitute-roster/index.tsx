import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  saveRdlToLocalStorage,
  getRdlFromLocalStorage,
} from "ui/components/reporting/helpers";

export const SubstituteRosterReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  // TODO: Once we have Saved Views, the need for this localStorage piece
  // goes away. The localStorageKey has the Date in it on the off chance
  // we need to come into here and modify the canned report RDL prior to
  // implementing Saved Views and want to make sure all Users default back
  // to the RDL that we define the next time they visit this report.
  const localStorageKey = "SubRosterReport_20200611";
  const rdl = React.useMemo(() => {
    const localStorageRdl = getRdlFromLocalStorage(localStorageKey);
    if (localStorageRdl) {
      return localStorageRdl;
    }

    return "QUERY FROM Substitute WHERE (Active = '1') SELECT Concat(LastName, ', ', FirstName) AS Substitute WIDTH(250), ShadowOrgName, ExternalId, Active, InvitationStatus, Endorsements, HasEndorsements, Email, LoginEmail ORDER BY Concat(LastName, ', ', FirstName) ASC";
  }, []);

  return (
    <Report
      title={t("Substitute Roster")}
      rdl={rdl}
      exportFilename={t("SubstituteRosterReport")}
      allowedFilterFieldsOverride={[
        "Active",
        "InvitationStatus",
        "EndorsementId",
        "HasEndorsements",
        "SourceOrgId",
      ]}
      saveRdl={(rdl: string) => saveRdlToLocalStorage(localStorageKey, rdl)}
    />
  );
};
