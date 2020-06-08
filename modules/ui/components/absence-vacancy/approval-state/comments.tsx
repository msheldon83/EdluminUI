import * as React from "react";
import { Section } from "ui/components/section";
import {
  Grid,
  makeStyles,
  FormControlLabel,
  TextField,
  Checkbox,
  Button,
} from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { ApprovalAction } from "graphql/server-types.gen";
import { Approve } from "./graphql/approve.gen";
import { Deny } from "./graphql/deny.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { LeaveComment } from "./leave-comment";
import { WorkflowSummary } from "./approval-flow";
import { useApproverGroups } from "ui/components/domain-selects/approver-group-select/approver-groups";
import { GetApprovalWorkflowById } from "./graphql/get-approval-workflow-steps-by-id.gen";
import { parseISO, format } from "date-fns";

type Props = {
  orgId: string;
  actingAsEmployee?: boolean;
  approvalStateId: string;
  comments: {
    comment?: string | null;
    commentIsPublic: boolean;
    createdLocal?: string | null;
    actingOrgUser: {
      firstName: string;
      lastName: string;
    };
    approvalDecisionId?: string | null;
    approvalDecision?: {
      approvalActionId: ApprovalAction;
    } | null;
  }[];
};

export const ApprovalComments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [allCommentsShown, setAllCommentsShown] = useState(false);

  return (
    <Grid item container xs={12} spacing={2}>
      {props.comments.length === 0 ? (
        <Grid item xs={12}>
          {t("No Comments")}
        </Grid>
      ) : (
        props.comments.map((c, i) => {
          return (
            <Grid key={i} item xs={12}>
              <div className={classes.commentContainer}>
                <div>
                  {c.commentIsPublic ? (
                    <img src={require("ui/icons/comment.svg")} />
                  ) : (
                    <img
                      src={require("ui/icons/comment-visible-to-admin.svg")}
                    />
                  )}
                </div>
                <div>
                  <div>
                    <span
                      className={classes.nameText}
                    >{`${c.actingOrgUser.firstName} ${c.actingOrgUser.lastName}`}</span>
                    <span className={classes.dateText}>{` @ ${format(
                      parseISO(c.createdLocal!),
                      "MMM d h:mm a"
                    )}`}</span>
                  </div>
                  <div>{c.comment}</div>
                </div>
              </div>
            </Grid>
          );
        })
      )}

      <Grid item xs={12}>
        <LeaveComment
          approvalStateId={props.approvalStateId}
          actingAsEmployee={props.actingAsEmployee}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  commentContainer: {
    display: "flex",
  },
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
    alignItems: "space-between",
  },
  nameText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "bold",
  },
  dateText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "normal",
    color: "#C4C4C4",
  },
}));
