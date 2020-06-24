import * as React from "react";
import { useMemo } from "react";
import { Button, makeStyles } from "@material-ui/core";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { Approve } from "ui/components/absence-vacancy/approval-state/graphql/approve.gen";
import { Deny } from "ui/components/absence-vacancy/approval-state/graphql/deny.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useTranslation } from "react-i18next";
import { useMyUserAccess } from "reference-data/my-user-access";
import { ApprovalStatus } from "graphql/server-types.gen";
import { GetApproverGroupsForOrgUser } from "./graphql/get-approver-groups-for-orguser.gen";
import { compact } from "lodash-es";

type Props = {
  orgId: string;
  approvalStateId: string;
  onApprove?: () => void;
  onDeny?: () => void;
  approvalStatus?: ApprovalStatus;
  currentApproverGroupHeaderId?: string | null;
  locationIds: string[];
};

export const ApproveDenyButtons: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const { locationIds, approvalStatus, currentApproverGroupHeaderId } = props;

  const userAccess = useMyUserAccess();
  const orgUserId = userAccess?.me?.user?.orgUsers?.find(
    x => x?.orgId === props.orgId && x.isAdmin
  )?.id;
  const getApproverGroups = useQueryBundle(GetApproverGroupsForOrgUser, {
    variables: {
      orgId: props.orgId,
      orgUserId: orgUserId ?? "",
    },
    skip: !orgUserId,
  });

  const myApproverGroupHeaders =
    getApproverGroups.state === "DONE"
      ? compact(
          getApproverGroups.data.approverGroup?.approverGroupHeadersByOrgUserId
        )
      : [];

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
    const currentApproverGroupHeader = myApproverGroupHeaders.find(
      x => x.id === currentApproverGroupHeaderId
    );
    if (
      currentApproverGroupHeader &&
      !currentApproverGroupHeader.variesByLocation
    )
      return true;

    // If the current group varies by location, am I in a group by location that applies to this absence/vacancy
    if (
      currentApproverGroupHeader &&
      !currentApproverGroupHeader.variesByLocation
    ) {
      const approverGroup = currentApproverGroupHeader.approverGroups.find(
        x => x?.locationId && locationIds.includes(x.locationId)
      );
      if (approverGroup) return true;
    }

    return false;
  }, [
    userAccess?.isSysAdmin,
    approvalStatus,
    myApproverGroupHeaders,
    currentApproverGroupHeaderId,
    locationIds,
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
