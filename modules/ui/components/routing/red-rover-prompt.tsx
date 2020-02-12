import React from "react";
import ReactDOM from "react-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
} from "@material-ui/core";
//import { makeStyles } from "@material-ui/styles";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
//import { useTranslation } from "react-i18next";

const RedRoverPrompt = (message: any, callback: any) => {
  //const classes = useStyles();
  //const { t } = useTranslation();

  const container = document.createElement("div");
  container.setAttribute("custom-confirmation-navigation", "");
  document.body.appendChild(container);
  const closeModal = (callbackState: any) => {
    ReactDOM.unmountComponentAtNode(container);
    callback(callbackState);
  };
  ReactDOM.render(
    <Dialog open={true} onClose={() => closeModal(false)}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{"Need a title"}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>

      <Divider />
      <DialogActions>
        <ButtonDisableOnClick onClick={() => closeModal(false)}>
          No, go back
        </ButtonDisableOnClick>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={() => closeModal(true)}
        >
          Cancel
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>,
    container
  );
};
export default RedRoverPrompt;

/*const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  cancel: { color: theme.customColors.darkRed },
}));*/
