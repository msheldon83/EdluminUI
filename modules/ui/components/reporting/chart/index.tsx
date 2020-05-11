import * as React from "react";
import { ReportDefinition } from "../types";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";

type Props = {
  reportDefinition: ReportDefinition | undefined;
  isLoading: boolean;
};

export const ReportChart: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return null;
};

const useStyles = makeStyles(theme => ({}));
