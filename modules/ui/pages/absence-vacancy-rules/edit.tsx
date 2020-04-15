import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";

type Props = {};

export const EditAbsenceVacancyRules: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <>
      <PageTitle title={t("Absence & Vacancy Rules")} />
    </>
  );
};
