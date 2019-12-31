import * as React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  view: "list" | "calendar";
};

export const ContractScheduleHeader: React.FC<Props> = props => {
  const { t } = useTranslation();

  return <></>;
};
