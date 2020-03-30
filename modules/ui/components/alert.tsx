import * as React from "react";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import CloseIcon from "@material-ui/icons/Close";
import { Alert, AlertTitle } from "@material-ui/lab";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  message: string;
  title: string;
};

export const AlertBox: React.FC<Props> = props => {
  return (
    <>
      <div>
        <Collapse in={props.open}>
          <Alert
            severity={"info"}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  props.setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>{props.title}</AlertTitle>
            {props.message}
          </Alert>
        </Collapse>
      </div>
    </>
  );
};
