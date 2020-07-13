import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  makeStyles,
  Divider,
  DialogActions,
  DialogTitle,
  Typography,
  FormControlLabel,
  TextField,
  Checkbox,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useMutationBundle } from "graphql/hooks";
import { SkipApproval } from "../graphql/skip-approval.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";

type Props = {
  approvalStateId: string;
  open: boolean;
  onClose: () => void;
  onSkip?: () => void;
  currentApproverGroupName: string;
  nextApproverGroupName: string;
};

export const SkipDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [comment, setComment] = useState("");
  const [commentIsPublic, setCommentIsPublic] = useState(true);

  const [skip] = useMutationBundle(SkipApproval, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const handleSkip = async () => {
    const result = await skip({
      variables: {
        approvalState: {
          approvalStateId: props.approvalStateId,
          comment: comment,
          commentIsPublic: commentIsPublic,
        },
      },
    });
    if (result?.data) {
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
        <div>{`${t("Would you like to skip")} ${
          props.currentApproverGroupName
        } ${t("and go to")} ${props.nextApproverGroupName}?`}</div>
        <div className={classes.commentContainer}>
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
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
  },
  commentContainer: {
    paddingTop: theme.spacing(2),
  },
}));
