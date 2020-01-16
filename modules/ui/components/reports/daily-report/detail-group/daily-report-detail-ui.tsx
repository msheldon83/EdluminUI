import { Checkbox, Grid, Link, makeStyles, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "ui/components/action-menu";
import { Detail } from "../helpers";
import { Can } from "ui/components/auth/can";
import { canAssignSub } from "helpers/permissions";
import { PermissionEnum } from "graphql/server-types.gen";
import { CanDo, OrgUserPermissions } from "ui/components/auth/types";

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
  goToAbsenceEdit: (absenceId: string) => void;
  hideCheckbox: boolean;
  isChecked: boolean;
  rowActions: {
    name: string;
    onClick: () => void;
    permissions?: CanDo;
  }[];
};

export const DailyReportDetailUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Grid item xs={12} container className={props.className}>
      <Grid item xs={3} zeroMinWidth>
        <div className={classes.employeeSection}>
          <Can
            do={(
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string
            ) =>
              canAssignSub(props.detail.date, permissions, isSysAdmin, orgId)
            }
          >
            <Checkbox
              color="primary"
              className={clsx({
                [classes.hidden]: props.hideCheckbox,
                [classes.checkbox]: true,
              })}
              checked={props.isChecked}
              onChange={e => {
                props.updateSelectedDetails(props.detail, e.target.checked);
              }}
            />
          </Can>
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
          <div className={classes.subWithPhone}>
            <div>{props.detail.substitute.name}</div>
            {props.detail.substitute.phone && (
              <div className={classes.subPhoneInfoIcon}>
                <Tooltip title={props.detail.substitute.phone} placement="top">
                  <InfoIcon color="primary" />
                </Tooltip>
              </div>
            )}
          </div>
        )}
        {props.detail.state !== "noSubRequired" && !props.detail.substitute && (
          <Can
            do={(
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string
            ) =>
              canAssignSub(props.detail.date, permissions, isSysAdmin, orgId)
            }
          >
            <Link
              className={classes.action}
              onClick={() => props.goToAbsenceEdit(props.detail.id)}
            >
              {t("Assign")}
            </Link>
          </Can>
        )}
        {props.detail.subStartTime && props.detail.subEndTime && (
          <div className={classes.detailSubText}>
            {`${props.detail.subStartTime} - ${props.detail.subEndTime}`}
          </div>
        )}
      </Grid>
      <Grid item xs={1} zeroMinWidth>
        <div>
          {props.detail.type === "absence" ? (
            <Link
              className={classes.action}
              onClick={() => props.goToAbsenceEdit(props.detail.id)}
            >{`#${props.detail.id}`}</Link>
          ) : (
            `#V${props.detail.id}`
          )}
        </div>
        {props.detail.assignmentId && (
          <div
            className={classes.detailSubText}
          >{`#C${props.detail.assignmentId}`}</div>
        )}
      </Grid>
      <Grid item xs={1} className={classes.detailActionsSection}>
        <ActionMenu options={props.rowActions} />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  employeeSection: {
    display: "flex",
  },
  subWithPhone: {
    display: "flex",
    alignItems: "center",
  },
  subPhoneInfoIcon: {
    marginLeft: theme.spacing(),
    "@media print": {
      display: "none",
    },
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
