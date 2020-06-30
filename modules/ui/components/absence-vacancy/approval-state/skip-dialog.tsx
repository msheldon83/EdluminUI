import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  makeStyles,
  FormControlLabel,
  TextField,
  Checkbox,
  Divider,
  DialogActions,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useMutationBundle } from "graphql/hooks";
import { SkipApproval } from "./graphql/skip-approval.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  onSkip?: () => void;
};

export const SkipDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [approve] = useMutationBundle(SkipApproval, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [comment, setComment] = useState("");
  const [commentIsPublic, setCommentIsPublic] = useState(true);

  const handleSkip = async () => {
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
      if (props.onSkip) {
        props.onSkip();
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
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Skip step")}</Typography>
      </DialogTitle>
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
        </div>
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("No, go back")}
        </TextButton>
        <ButtonDisableOnClick variant="outlined" onClick={handleSkip}>
          {t("Skip")}
        </ButtonDisableOnClick>
      </DialogActions>
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
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
}));
