import * as React from "react";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { format, isValid, parseISO } from "date-fns";

type Props = {
  isAvailableToSubWhenSearching: boolean;
  visible: boolean;
  visibleOn?: string | null | undefined;
};

export const VisibleIcon: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!props.isAvailableToSubWhenSearching) {
    return <VisibilityOff className={classes.icon} />;
  }

  if (props.visible) {
    return <Visibility className={classes.icon} />;
  }

  // This shouldn't happen, but just in case and to make TS happy
  // with the use of "parseISO(props.visibleOn)" below
  if (!props.visibleOn) {
    return <VisibilityOff className={classes.icon} />;
  }

  const iso = parseISO(props.visibleOn);
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
