import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { useState } from "react";
import { Filters } from "./components/filters";
import { VerifyUI } from "./ui";
import { useRouteParams } from "ui/routes/definition";
import { VerifyRoute } from "ui/routes/absence-vacancy/verify";
import Typography from "@material-ui/core/Typography";
import { startOfToday, subDays } from "date-fns";

export const VerifyPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const today = startOfToday();
  const [timePeriod, setTimePeriod] = useState<{ start: Date; end: Date }>({
    start: subDays(today, 29),
    end: today,
  });
  const [locationsFilter, setLocationsFilter] = useState<string[]>([]);
  const [subSourceFilter, setSubSourceFilter] = useState<string>("");
  const [showFullyVerified, setShowFullyVerified] = useState(false);
  const params = useRouteParams(VerifyRoute);

  return (
    <>
      <Typography variant="h5">{t("Verify substitute assignments")}</Typography>
      <PageTitle title={t("Verify substitute assignments")} />
      <Section>
        <Filters
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          locationsFilter={locationsFilter}
          setLocationsFilter={setLocationsFilter}
          subSourceFilter={subSourceFilter}
          setSubSourceFilter={setSubSourceFilter}
          showFullyVerified={showFullyVerified}
          setShowFullyVerified={setShowFullyVerified}
          orgId={params.organizationId}
        />
      </Section>
      <VerifyUI
        showVerified={showFullyVerified}
        locationsFilter={locationsFilter}
        subSourceFilter={subSourceFilter}
      />
    </>
  );
};
