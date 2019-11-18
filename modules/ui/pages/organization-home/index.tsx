import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";

export const OrganizationsHome: React.FC = props => {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={`${t("Organization Home")}`} />
    </>
  );
};
