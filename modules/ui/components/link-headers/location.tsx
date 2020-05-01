import * as React from "react";
import { useTranslation } from "react-i18next";
import { LinkHeader } from "./base";
import { LocationViewRoute } from "ui/routes/locations";

type Props = {
  title: string;
  locationName: string;
  params: {
    organizationId: string;
    locationId: string;
  };
};

export const LocationLinkHeader: React.FC<Props> = ({
  params,
  locationName,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <LinkHeader
      to={LocationViewRoute.generate(params)}
      linkText={t("Return to details")}
      subtitle={locationName}
      {...props}
    />
  );
};
