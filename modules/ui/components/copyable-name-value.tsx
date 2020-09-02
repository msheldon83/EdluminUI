import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, SvgIconProps, Typography } from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import { useSnackbar } from "hooks/use-snackbar";

export const CopyButton: React.FC<{
  name: string;
  value: string;
} & SvgIconProps> = ({ name, value, ...svgProps }) => {
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const copyToClipboard = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    snackbar.openSnackbar({
      message: `${name} ${t("copied to clipboard")}`,
      autoHideDuration: 2000,
      dismissable: true,
      status: "success",
    });
  };

  return (
    <FileCopyIcon
      fontSize="inherit"
      onClick={() => copyToClipboard(name, value)}
      {...svgProps}
    />
  );
};

export const CopyableNameValue: React.FC<{
  name: string;
  value?: string | null;
  masked?: boolean;
}> = ({ name, value, masked = false }) => {
  const [show, setShow] = useState(!masked);
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6">{name}</Typography>
      {value ? (
        <Typography>
          {show ? value : "*".repeat(value.length)}
          <CopyButton name={name} value={value} className={classes.fieldIcon} />
          {masked &&
            (show ? (
              <VisibilityOffIcon
                onClick={() => setShow(false)}
                className={classes.fieldIcon}
                fontSize="inherit"
              />
            ) : (
              <VisibilityIcon
                onClick={() => setShow(true)}
                className={classes.fieldIcon}
                fontSize="inherit"
              />
            ))}
        </Typography>
      ) : (
        <Typography>--</Typography>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  fieldIcon: {
    marginLeft: theme.spacing(1),
  },
}));
