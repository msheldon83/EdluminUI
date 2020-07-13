import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { compact } from "lodash-es";
import { useTranslation } from "react-i18next";
import { Maybe } from "graphql/server-types.gen";
import { ApprovalWorkflowSteps } from "./types";

type Props = {
  workflowName: string;
  pendingApproverGroupHeaderName?: string | null;
  deniedApproverGroupHeaderName?: string | null;
  approvedApproverGroupHeaderNames?: Maybe<string>[] | null;
  nextSteps?:
    | Maybe<{
        approverGroupHeader?: {
          name: string;
        } | null;
      }>[]
    | null;
};

export const WorkflowSummary: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    pendingApproverGroupHeaderName,
    deniedApproverGroupHeaderName,
    approvedApproverGroupHeaderNames,
    nextSteps,
    workflowName,
  } = props;

  const renderApprovedSteps = () => {
    return (
      <div>
        <div className={classes.titleText}>{t("Approved by:")}</div>
        <div className={classes.stepsContainer}>
          {approvedApproverGroupHeaderNames?.map((name, i) => {
            return (
              <div key={i} className={classes.approvedBox}>
                <span className={classes.groupNameText}>{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDeniedStep = () => {
    return (
      <div>
        <div className={classes.titleText}>{t("Denied by:")}</div>
        <div className={classes.stepsContainer}>
          <div className={classes.deniedBox}>
            <span className={classes.groupNameText}>
              {deniedApproverGroupHeaderName}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderPendingStep = () => {
    return (
      <div>
        <div className={classes.titleText}>{t("Pending:")}</div>
        <div className={classes.pendingBox}>
          <span className={classes.groupNameText}>
            {pendingApproverGroupHeaderName}
          </span>
        </div>
      </div>
    );
  };

  const renderNextSteps = () => {
    return (
      <div>
        <div className={classes.titleText}>{t("Next:")}</div>
        <div className={classes.stepsContainer}>
          {compact(nextSteps)?.map((s, i) => {
            return (
              <div key={i} className={classes.nextBox}>
                <span className={classes.nextText}>
                  {s.approverGroupHeader?.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={classes.container}>
      <div className={classes.workflowTitle}>{workflowName}</div>
      <div className={classes.stepsContainer}>
        {approvedApproverGroupHeaderNames &&
          approvedApproverGroupHeaderNames.length > 0 &&
          renderApprovedSteps()}
        {deniedApproverGroupHeaderName && renderDeniedStep()}
        {!deniedApproverGroupHeaderName &&
          pendingApproverGroupHeaderName &&
          renderPendingStep()}
        {!deniedApproverGroupHeaderName &&
          nextSteps &&
          nextSteps.length > 0 &&
          renderNextSteps()}
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    width: "100%",
  },
  stepsContainer: {
    display: "flex",
    width: "100%",
    overflowX: "auto",
  },
  titleText: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(16),
    marginBottom: theme.spacing(0.5),
  },
  workflowTitle: {
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(14),
  },
  groupNameText: {
    verticalAlign: "middle",
    display: "inline-block",
    lineHeight: "normal",
  },
  approvedBox: {
    border: "1px solid #4CC17C",
    background: "#E6F5ED",
    boxSizing: "border-box",
    width: "115px",
    height: "80px",
    lineHeight: "80px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),
  },
  deniedBox: {
    border: "1px solid #C62828",
    background: "#FFDDDD",
    boxSizing: "border-box",
    width: "115px",
    height: "80px",
    lineHeight: "80px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),
  },
  pendingBox: {
    border: "1px solid #050039",
    background: "#FFFFFF",
    boxSizing: "border-box",
    width: "115px",
    height: "80px",
    lineHeight: "80px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),
  },
  nextBox: {
    border: "1px solid #9B99B0",
    boxSizing: "border-box",
    background: "#FFFFFF",
    width: "115px",
    height: "80px",
    lineHeight: "80px",
    textAlign: "center",
    wordWrap: "break-word",
    marginRight: theme.spacing(1),
  },
  nextText: {
    color: "#8997B1",
    verticalAlign: "middle",
    display: "inline-block",
    lineHeight: "normal",
  },
}));
