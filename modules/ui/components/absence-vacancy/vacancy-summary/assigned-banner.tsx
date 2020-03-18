import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { AssignmentFor } from "./types";

type Props = {
  assignedTo: AssignmentFor;
  onReassignClick: () => Promise<void>;
  onRemoveClick: () => Promise<void>;
};

export const AssignedBanner: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return <></>;
};

export const useStyles = makeStyles(theme => ({}));
