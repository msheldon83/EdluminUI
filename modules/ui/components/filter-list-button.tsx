import { Button } from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import * as React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  onClick: () => void;
};
export const FilterListButton: React.FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Button variant="outlined" color="primary" onClick={props.onClick}>
      <FilterListIcon /> {t("Filter List")}
    </Button>
  );
};
