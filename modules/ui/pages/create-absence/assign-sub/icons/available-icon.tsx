import * as React from "react";
import { VacancyAvailability } from "graphql/server-types.gen";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Close, Check } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

type Props = {
  available: VacancyAvailability;
};

export const AvailableIcon: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  switch (props.available) {
    case VacancyAvailability.Yes:
      return <Check className={classes.available} />;
    case VacancyAvailability.MinorConflict:
      return (
        <Tooltip title={t("Minor conflict")}>
          <img src={require("ui/icons/check-info.svg")} />
        </Tooltip>
      );
    case VacancyAvailability.No:
      return <Close className={classes.notAvailable} />;
  }
};

const useStyles = makeStyles(theme => ({
  available: {
    color: theme.customColors.grass,
  },
  notAvailable: {
    color: theme.customColors.tomato,
  },
}));
