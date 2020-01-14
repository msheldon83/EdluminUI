import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link, Tooltip } from "@material-ui/core";
import { Detail } from "./helpers";
import clsx from "clsx";
import { ActionMenu } from "ui/components/action-menu";
import InfoIcon from "@material-ui/icons/Info";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { Can } from "ui/components/auth/can";
import { canAssignSub, canEditSub, canRemoveSub } from "helpers/permissions";
import { OrgUserPermissions } from "reference-data/my-user-access";

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
  const history = useHistory();
  const absenceEditParams = useRouteParams(AdminEditAbsenceRoute);
  const adminParams = useRouteParams(AdminHomeRoute);

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

  const goToAbsenceEdit = (absenceId: string) => {
    const url = AdminEditAbsenceRoute.generate({
      ...absenceEditParams,
      absenceId,
    });
    history.push(url, {
      returnUrl: `${history.location.pathname}${history.location.search}`,
    });
  };

  const rowActions = [
    {
      name: t("Edit"),
      onClick: () => goToAbsenceEdit(props.detail.id),
      permissions: (
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string
      ) => canEditSub(permissions, isSysAdmin, orgId, props.detail.date),
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
          goToAbsenceEdit(props.detail.id);
        }
      },
      permissions: props.detail.substitute
        ? (
            permissions: OrgUserPermissions[],
            isSysAdmin: boolean,
            orgId?: string
          ) => canRemoveSub(permissions, isSysAdmin, orgId, props.detail.date)
        : (
            permissions: OrgUserPermissions[],
            isSysAdmin: boolean,
            orgId?: string
          ) => canAssignSub(permissions, isSysAdmin, orgId, props.detail.date),
    });
  }

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
              canAssignSub(permissions, isSysAdmin, orgId, props.detail.date)
            }
          >
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
              canAssignSub(permissions, isSysAdmin, orgId, props.detail.date)
            }
          >
            <Link
              className={classes.action}
              onClick={() => goToAbsenceEdit(props.detail.id)}
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
              onClick={() => goToAbsenceEdit(props.detail.id)}
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
        <ActionMenu options={rowActions} />
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
