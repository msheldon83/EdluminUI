import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link, Tooltip } from "@material-ui/core";
import { Detail } from "./helpers";
import clsx from "clsx";
import { ActionMenu } from "ui/components/action-menu";
import InfoIcon from "@material-ui/icons/Info";

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
};

export const DailyReportDetail: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const isChecked = !!props.selectedDetails.find(
    d => d.detailId === props.detail.detailId && d.type === props.detail.type
  );
  const existingUnfilledSelection = !!props.selectedDetails.find(
    d => d.state === "unfilled"
  );
  const hideCheckbox =
    props.detail.isMultiDay ||
    props.detail.state === "noSubRequired" ||
    (!isChecked &&
      existingUnfilledSelection &&
      props.detail.state === "unfilled");

  const rowActions = [
    {
      name: t("Edit"),
      onClick: () => {
        /* TODO: Redirect to Absence Edit screen */
      },
    },
  ];
  if (props.detail.state !== "noSubRequired") {
    rowActions.push({
      name: props.detail.substitute ? t("Remove Sub") : t("Assign Sub"),
      onClick: async () => {
        if (props.detail.substitute) {
          await props.removeSub(
            props.detail.assignmentId,
            props.detail.assignmentRowVersion
          );
        } else {
          /* TODO: Redirect to Absence Edit screen */
        }
      },
    });
  }

  return (
    <Grid item xs={12} container className={props.className}>
      <Grid item xs={3} zeroMinWidth>
        <div className={classes.employeeSection}>
          <Checkbox
            color="primary"
            className={clsx({
              [classes.hidden]: hideCheckbox,
              [classes.checkbox]: true,
            })}
            checked={isChecked}
            onChange={e => {
              props.updateSelectedDetails(props.detail, e.target.checked);
            }}
          />
          <div>
            {props.detail.type === "absence" ? (
              <>
                <div>{props.detail.employee?.name}</div>
                <div className={classes.detailSubText}>
                  {props.detail.position?.name}
                </div>
              </>
            ) : (
              <div>{props.detail.position?.name}</div>
            )}
          </div>
        </div>
      </Grid>
      <Grid item xs={2} zeroMinWidth>
        <div>{props.detail.absenceReason}</div>
        <div className={classes.detailSubText}>{props.detail.dateRange}</div>
      </Grid>
      <Grid item xs={2} zeroMinWidth>
        <div>{props.detail.location?.name}</div>
        <div
          className={classes.detailSubText}
        >{`${props.detail.startTime} - ${props.detail.endTime}`}</div>
      </Grid>
      <Grid item xs={1}>
        <div>{props.detail.created}</div>
      </Grid>
      <Grid item xs={2} zeroMinWidth>
        {props.detail.state === "noSubRequired" && (
          <div className={classes.detailSubText}>{t("Not required")}</div>
        )}
        {props.detail.state !== "noSubRequired" && props.detail.substitute && (
          <div>
            {props.detail.substitute.name}{" "}
            {props.detail.substitute.phone && (
              <Tooltip title={props.detail.substitute.phone} placement="top">
                <InfoIcon color="primary" />
              </Tooltip>
            )}
          </div>
        )}
        {props.detail.state !== "noSubRequired" && !props.detail.substitute && (
          <Link className={classes.action}>{t("Assign")}</Link>
        )}
        {props.detail.subStartTime && props.detail.subEndTime && (
          <div className={classes.detailSubText}>
            {`${props.detail.subStartTime} - ${props.detail.subEndTime}`}
          </div>
        )}
      </Grid>
      <Grid item xs={1} zeroMinWidth>
        <div>
          {props.detail.type === "absence"
            ? `#${props.detail.id}`
            : `#V${props.detail.id}`}
        </div>
        {props.detail.assignmentId && (
          <div
            className={classes.detailSubText}
          >{`#C${props.detail.assignmentId}`}</div>
        )}
      </Grid>
      <Grid item xs={1} className={classes.detailActionsSection}>
        <ActionMenu options={rowActions} />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  employeeSection: {
    display: "flex",
  },
  detailSubText: {
    color: theme.customColors.edluminSubText,
  },
  detailActionsSection: {
    textAlign: "right",
    "@media print": {
      display: "none",
    },
  },
  action: {
    cursor: "pointer",
  },
  checkbox: {
    "@media print": {
      display: "none",
    },
  },
  hidden: {
    visibility: "hidden",
  },
}));
