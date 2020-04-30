import * as React from "react";
import { useTranslation } from "react-i18next";
import { LinkHeader } from "./base";
import { PersonViewRoute } from "ui/routes/people";

type Props = {
  title: string;
  person?: {
    firstName: string;
    lastName: string;
  };
  params: {
    organizationId: string;
    orgUserId: string;
  };
};

export const PersonLinkHeader: React.FC<Props> = ({
  params,
  person,
  ...props
}) => {
  const { t } = useTranslation();
  const subtitle = person
    ? person.firstName + " " + person.lastName
    : undefined;
  return (
    <LinkHeader
      to={PersonViewRoute.generate(params)}
      linkText={t("Return to details")}
      subtitle={subtitle}
      {...props}
    />
  );
};
