import * as React from "react";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

type Props = {
  visible: boolean;
  visibleOn?: Date | null | undefined;
};

export const VisibleIcon: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (props.visible) {
    return <Visibility className={classes.icon} />;
  }

  if (!props.visibleOn) {
    return <VisibilityOff className={classes.icon} />;
  }

  return (
    <Tooltip title={`${t("Visible on")} ${props.visibleOn}`}>
      <img src={require("ui/icons/visibility_time.svg")} />
    </Tooltip>
  );
};

const useStyles = makeStyles(theme => ({
  icon: {
    color: "#9E9E9E",
  },
}));
