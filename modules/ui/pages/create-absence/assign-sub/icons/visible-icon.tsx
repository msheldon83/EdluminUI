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

  if (props.isAvailableToSubWhenSearching) {
    // Sub can currently see this job
    return <Visibility className={classes.icon} />;
  }

  if (props.visibleOn) {
    // Sub will eventually be able to see this job
    const iso = parseISO(props.visibleOn);
    const date = isValid(iso) && format(iso, "MMM d, yyyy h:mm aa");
    return (
      <Tooltip title={`${t("Visible on")} ${date}`}>
        <img src={require("ui/icons/visibility_time.svg")} />
      </Tooltip>
    );
  }

  // Sub will never be able to see this job
  return <VisibilityOff className={classes.icon} />;
};

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.customColors.edluminSubText,
  },
}));
