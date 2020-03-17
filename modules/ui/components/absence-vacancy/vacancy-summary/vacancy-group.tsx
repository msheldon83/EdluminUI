import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

type Props = {};

export const VacancyGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return <></>;
};

export const useStyles = makeStyles(theme => ({}));
