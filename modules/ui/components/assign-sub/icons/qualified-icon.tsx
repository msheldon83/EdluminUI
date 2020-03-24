import * as React from "react";
import { VacancyQualification } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import SignalCellularAltIcon from "@material-ui/icons/SignalCellularAlt";
import { CellularIcon } from "ui/components/cellular-icon";

type Props = {
  qualified: VacancyQualification;
};

export const QualifiedIcon: React.FC<Props> = props => {
  const classes = useStyles();

  switch (props.qualified) {
    case VacancyQualification.Fully:
      return <CellularIcon highlightedBars={3} />;
    case VacancyQualification.Minimally:
      return <CellularIcon highlightedBars={1} />;
    case VacancyQualification.NotQualified:
      return <ClearIcon className={classes.notAvailable} />;
  }
};

const useStyles = makeStyles(theme => ({
  available: {
    color: theme.customColors.edluminSlate,
  },
  notAvailable: {
    color: theme.customColors.edluminSubText,
  },
}));
