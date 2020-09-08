import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Typography } from "@material-ui/core";
import { ConnectionDirection } from "graphql/server-types.gen";

export const ConnectionDirectionText: React.FC<{
  direction: ConnectionDirection;
  appName: string;
  className?: string;
}> = ({ direction, appName, className }) => {
  const { t } = useTranslation();
  return (
    <Typography className={className}>
      {direction == ConnectionDirection.Outbound
        ? `${t("From Red Rover to")} ${appName}`
        : `${t("From")} ${appName} ${t("to Red Rover")}`}
    </Typography>
  );
};
