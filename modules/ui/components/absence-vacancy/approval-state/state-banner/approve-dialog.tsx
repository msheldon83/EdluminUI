import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  makeStyles,
  FormControlLabel,
  TextField,
  Checkbox,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useMutationBundle } from "graphql/hooks";
import { Approve } from "../graphql/approve.gen";
import { Deny } from "../graphql/deny.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  onApproveDeny?: () => void;
};

export const ApproveDenyDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [approve] = useMutationBundle(Approve, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deny] = useMutationBundle(Deny, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [comment, setComment] = useState("");
  const [commentIsPublic, setCommentIsPublic] = useState(true);

  const handleApprove = async () => {
    const result = await approve({
      variables: {
        approvalState: {
          approvalStateId: props.approvalStateId,
          comment: comment,
          commentIsPublic: commentIsPublic,
        },
      },
    });
    if (result.data) {
      if (props.onApproveDeny) {
        props.onApproveDeny();
      }
      props.onClose();
    }
  };

  const handleDeny = async () => {
    const result = await deny({
      variables: {
        approvalState: {
          approvalStateId: props.approvalStateId,
          comment: comment,
          commentIsPublic: commentIsPublic,
        },
      },
    });
    if (result.data) {
      if (props.onApproveDeny) {
        props.onApproveDeny();
      }
      props.onClose();
    }
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={false}
      maxWidth={"sm"}
    >
      <DialogContent>
        <div>{t("Comment")}</div>
        <TextField
          multiline={true}
          rows="3"
          value={comment}
          fullWidth={true}
          variant="outlined"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setComment(e.target.value);
          }}
        />
        <div className={classes.buttonContainer}>
          <FormControlLabel
            checked={commentIsPublic}
            control={
              <Checkbox
                onChange={e => {
                  setCommentIsPublic(e.target.checked);
                }}
                color="primary"
              />
            }
            label={t("Visible to employee")}
          />
          <Button
            className={classes.denyButton}
            variant="contained"
            onClick={handleDeny}
          >
            {t("Deny")}
          </Button>
          <Button
            className={classes.approveButton}
            variant="contained"
            onClick={handleApprove}
          >
            {t("Approve")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  approveButton: {
    background: "#4CC17C",
  },
  denyButton: {
    background: "#FF5555",
    marginRight: theme.spacing(1),
  },
  buttonContainer: {
    display: "flex",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));
