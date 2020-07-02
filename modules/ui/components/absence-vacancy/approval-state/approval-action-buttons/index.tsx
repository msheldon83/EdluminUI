import * as React from "react";
import { useState } from "react";
import { Button, makeStyles } from "@material-ui/core";
import { useMutationBundle } from "graphql/hooks";
import { Approve } from "ui/components/absence-vacancy/approval-state/graphql/approve.gen";
import { Deny } from "ui/components/absence-vacancy/approval-state/graphql/deny.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useTranslation } from "react-i18next";
import { SkipDialog } from "./skip-dialog";
import { ResetDialog } from "./reset-dialog";
import { ActionMenu, Option } from "ui/components/action-menu";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  approvalStateId: string;
  canApprove: boolean;
  onApprove?: () => void;
  onDeny?: () => void;
  onSkip?: () => void;
  onReset?: () => void;
  showSkip: boolean;
  showReset: boolean;
  currentApproverGroupName: string;
  nextApproverGroupName: string;
  previousSteps: {
    stepId: string;
    approverGroupHeaderName: string;
  }[];
};

export const ApprovalActionButtons: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

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

  const handleApprove = async () => {
    const result = await approve({
      variables: {
        approvalState: {
          approvalStateId: props.approvalStateId,
        },
      },
    });
    if (result?.data && props.onApprove) {
      props.onApprove();
    }
  };

  const handleDeny = async () => {
    const result = await deny({
      variables: {
        approvalState: {
          approvalStateId: props.approvalStateId,
        },
      },
    });
    if (result?.data && props.onDeny) {
      props.onDeny();
    }
  };

  const menuOptions = [] as Option[];

  if (props.showSkip) {
    menuOptions.push({
      name: t("Skip"),
      onClick: () => setSkipDialogOpen(true),
      permissions: [PermissionEnum.AbsVacApprovalsSkip],
    });
  }

  if (props.showReset) {
    menuOptions.push({
      name: t("Reset"),
      onClick: () => setResetDialogOpen(true),
      permissions: [PermissionEnum.AbsVacApprovalsReset],
    });
  }

  const onCloseSkipDialog = () => {
    setSkipDialogOpen(false);
  };

  const onCloseResetDialog = () => {
    setResetDialogOpen(false);
  };

  return (
    <>
      <SkipDialog
        approvalStateId={props.approvalStateId}
        open={skipDialogOpen}
        onClose={onCloseSkipDialog}
        currentApproverGroupName={props.currentApproverGroupName}
        onSkip={props.onSkip}
        nextApproverGroupName={props.nextApproverGroupName}
      />
      <ResetDialog
        approvalStateId={props.approvalStateId}
        open={resetDialogOpen}
        onClose={onCloseResetDialog}
        currentApproverGroupName={props.currentApproverGroupName}
        onReset={props.onReset}
        previousSteps={props.previousSteps}
      />
      <div className={classes.container}>
        <ActionMenu options={menuOptions} />
        {props.canApprove && (
          <div className={classes.buttonContainer}>
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
        )}
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  buttonContainer: {
    display: "flex",
    height: "36px",
  },
  approveButton: {
    background: "#4CC17C",
  },
  denyButton: {
    background: "#FF5555",
    marginRight: theme.spacing(1),
  },
}));
