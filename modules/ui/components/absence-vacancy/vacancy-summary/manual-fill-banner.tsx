import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

type Props = {
  onChangeManualFill?: (checked: boolean) => void;
};

export const ManualFillBanner: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <VisibilityOffIcon className={classes.icon} />
      <div className={clsx(classes.text)}>
        {t("Manual fill mode enabled. Substitutes cannot see this assignment.")}
      </div>
      <TextButton
        className={classes.button}
        onClick={() =>
          props.onChangeManualFill && props.onChangeManualFill(false)
        }
      >
        {t("Disable")}
      </TextButton>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1),
    width: "100%",
    background: "#FFF5CC",
    display: "flex",
    textAlign: "center",
  },
  icon: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    height: "20px",
    width: "20px",
  },
  button: {
    marginLeft: theme.spacing(2),
    color: theme.customColors.primary,
  },
  text: {
    lineHeight: "24px",
    verticalAlign: "middle",
  },
  displayInline: {
    display: "inline-block",
  },
}));
