import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { RegularSchedule } from "./components/regular-schedule";

export const SubAvailabilityPage: React.FC<{}> = props => {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t("My Availability")} />
      <RegularSchedule />
    </>
  );
};
