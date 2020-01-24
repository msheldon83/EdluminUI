import * as React from "react";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { format, isValid, parseISO, isBefore } from "date-fns";

type Props = {
  isAvailableToSubWhenSearching: boolean;
  availableToSubWhenSearchingAtUtc?: string | null | undefined;
  availableToSubWhenSearchingAtLocal?: string | null | undefined;
};

export const VisibleIcon: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (
    !props.isAvailableToSubWhenSearching ||
    !props.availableToSubWhenSearchingAtUtc ||
    !props.availableToSubWhenSearchingAtLocal
  ) {
    // Sub will never be able to see this job
    return <VisibilityOff className={classes.icon} />;
  }

  // Determine if the time the server told us this job would be
  // available to the Sub has actually already passed
  const availableToSubNow = isBefore(
    new Date(props.availableToSubWhenSearchingAtUtc),
    new Date()
  );

  if (availableToSubNow) {
    // Sub can currently see this job
    return <Visibility className={classes.icon} />;
  }

  // Sub will eventually be able to see this job
  const iso = parseISO(props.availableToSubWhenSearchingAtLocal);
  const date = isValid(iso) && format(iso, "MMM d, yyyy h:mm aa");
  return (
    <Tooltip title={`${t("Visible on")} ${date}`}>
      <img src={require("ui/icons/visibility_time.svg")} />
    </Tooltip>
  );
};

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.customColors.edluminSubText,
  },
}));
