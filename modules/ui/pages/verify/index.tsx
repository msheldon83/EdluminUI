import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { useState } from "react";
import { Filters } from "./components/filters";
import { VerifyUI } from "./ui";
import { useRouteParams } from "ui/routes/definition";
import { VerifyRoute } from "ui/routes/absence-vacancy/verify";

export const VerifyPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [showVerified, setShowVerified] = useState(false);
  const [locationsFilter, setLocationsFilter] = useState<string[]>([]);
  const params = useRouteParams(VerifyRoute);

  return (
    <>
      <PageTitle title={t("Verify substitute assignments")} />
      <Section>
        <Filters
          showVerified={showVerified}
          locationsFilter={locationsFilter}
          setShowVerified={setShowVerified}
          setLocationsFilter={setLocationsFilter}
          orgId={params.organizationId}
        />
      </Section>
      <VerifyUI showVerified={showVerified} locationsFilter={locationsFilter} />
    </>
  );
};
