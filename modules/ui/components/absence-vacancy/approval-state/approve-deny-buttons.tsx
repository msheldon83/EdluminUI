import * as React from "react";
import { useMemo } from "react";
import { Button, makeStyles } from "@material-ui/core";
import { useMutationBundle } from "graphql/hooks";
import { Approve } from "ui/components/absence-vacancy/approval-state/graphql/approve.gen";
import { Deny } from "ui/components/absence-vacancy/approval-state/graphql/deny.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useTranslation } from "react-i18next";
import { useMyUserAccess } from "reference-data/my-user-access";
import { ApprovalStatus } from "graphql/server-types.gen";
import { useMyApproverGroupHeaders } from "reference-data/my-approver-group-headers";

type Props = {
  approvalStateId: string;
  onApprove?: () => void;
  onDeny?: () => void;
  approvalStatus?: ApprovalStatus;
  currentApproverGroupHeaderId?: string | null;
};

export const ApproveDenyButtons: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const approvalStatus = props.approvalStatus;
  const currentApproverGroupHeaderId = props.currentApproverGroupHeaderId;

  const userAccess = useMyUserAccess();
  const myApproverGroupHeaders = useMyApproverGroupHeaders();

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
    if (result.data && props.onApprove) {
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
    if (result.data && props.onDeny) {
      props.onDeny();
    }
  };

  const showButtons = useMemo(() => {
    // Sys Admins are unable to approve or deny unless impersonating
    if (userAccess?.isSysAdmin) return false;

    // If the state is not pending, it has already been approved or denied
    if (
      approvalStatus !== ApprovalStatus.ApprovalRequired &&
      approvalStatus !== ApprovalStatus.PartiallyApproved
    )
      return false;

    // If I'm a member of the current group that needs to approve, show the buttons
    if (myApproverGroupHeaders.find(x => x.id === currentApproverGroupHeaderId))
      return true;
    return false;
  }, [
    userAccess?.isSysAdmin,
    approvalStatus,
    myApproverGroupHeaders,
    currentApproverGroupHeaderId,
  ]);

  return showButtons ? (
    <div className={classes.container}>
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
  ) : (
    <></>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    padding: theme.spacing(1),
  },
  approveButton: {
    background: "#4CC17C",
  },
  denyButton: {
    background: "#FF5555",
    marginRight: theme.spacing(1),
  },
}));
