import * as React from "react";
import { useTranslation } from "react-i18next";
import { LinkHeader } from "./base";
import { PersonViewRoute } from "ui/routes/people";

type Props = {
  title: string;
  subtitle?: string;
  params: {
    organizationId: string;
    orgUserId: string;
  };
};

export const SubstituteLinkHeader: React.FC<Props> = ({ params, ...props }) => {
  const { t } = useTranslation();
  return (
    <LinkHeader
      to={PersonViewRoute.generate(params)}
      linkText={t("Return to details")}
      {...props}
    />
  );
};
