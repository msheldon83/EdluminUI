import React from "react";
import ReactDOM from "react-dom";
import { Dialog, DialogActions, Divider } from "@material-ui/core";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";

const RedRoverPrompt = (message: any, callback: any) => {
  const container = document.createElement("div");
  container.setAttribute("custom-confirmation-navigation", "");
  document.body.appendChild(container);
  const closeModal = (callbackState: any) => {
    ReactDOM.unmountComponentAtNode(container);
    callback(callbackState);
  };
  ReactDOM.render(
    <Dialog open={true} onClose={() => closeModal(false)}>
      <div style={{ flex: "0 0 auto", margin: 0, padding: "16px 24px" }}>
        <h5
          style={{
            fontSize: "1.5rem",
            fontFamily: "Roboto",
            fontWeight: 400,
            lineHeight: 1.334,
            margin: 0,
          }}
        >
          This Page Has Unsaved Changes
        </h5>
      </div>
      <div style={{ flex: "1 1 auto", padding: "8px 24px", overflowY: "auto" }}>
        <p
          style={{
            fontSize: "0.875rem",
            fontFamily: "Roboto",
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>

      <Divider style={{ color: "#b4b6b9", marginTop: "16px" }} />
      <DialogActions>
        <ButtonDisableOnClick
          style={{ textDecoration: "underline" }}
          variant="text"
          onClick={() => closeModal(false)}
        >
          No, go back
        </ButtonDisableOnClick>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={() => closeModal(true)}
          style={{ color: "#2196F3" }}
        >
          DISCARD CHANGES
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>,
    container
  );
};
export default RedRoverPrompt;
