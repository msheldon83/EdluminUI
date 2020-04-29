import * as React from "react";
import { useTranslation } from "react-i18next";
import { LinkHeader } from "./base";
import { PersonViewRoute } from "ui/routes/people";

type Props = {
  title: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
  params: {
    organizationId: string;
    orgUserId: string;
  };
};

export const EmployeeLinkHeader: React.FC<Props> = ({
  params,
  employee,
  ...props
}) => {
  const { t } = useTranslation();
  const subtitle = employee
    ? employee.firstName + " " + employee.lastName
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
