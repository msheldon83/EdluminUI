import { Checkbox, Grid, Link, makeStyles, Tooltip } from "@material-ui/core";
/* import InfoIcon from "@material-ui/icons/Info"; */
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "ui/components/action-menu";
import { Detail } from "../helpers";
import { Can } from "ui/components/auth/can";
import { canAssignSub } from "helpers/permissions";
import { PermissionEnum } from "graphql/server-types.gen";
import { CanDo, OrgUserPermissions } from "ui/components/auth/types";
import PermDeviceInformationIcon from "@material-ui/icons/PermDeviceInformation";

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
  goToAbsenceEditAssign: (absenceId: string) => void;
  goToVacancyEdit: (absenceId: string) => void;
  goToVacancyEditAssign: (absenceId: string) => void;
  goToPersonView: (orgUserId: string | undefined) => void;
  goToLocationView: (locationId: string | undefined) => void;
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
    <div className={[classes.container, props.className].join(" ")}>
      <Can
        do={(
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string
        ) => canAssignSub(props.detail.date, permissions, isSysAdmin, orgId)}
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
      <div className={classes.locationSection}>
        {console.log(props.detail.position)}
        <div>
          {props.detail.type === "absence" ? (
            <>
              <div>
                <Can do={[PermissionEnum.EmployeeView]}>
                  <Link
                    className={classes.action}
                    onClick={() =>
                      props.goToPersonView(props.detail.employee?.id)
                    }
                  >
                    {props.detail.employee?.name}
                  </Link>
                </Can>
                <Can not do={[PermissionEnum.EmployeeView]}>
                  {props.detail.employee?.name}
                </Can>
              </div>
              <div className={classes.detailSubText}>
                {props.detail.position?.name}
              </div>
            </>
          ) : (
            <div>{`${t("Vacancy")}: ${props.detail.position?.name}`}</div>
          )}
        </div>
      </div>
      <div className={classes.reasonSection}>
        <div>
          <div>{props.detail.absenceReason}</div>
          <div className={classes.detailSubText}>{props.detail.dateRange}</div>
        </div>
      </div>
      <div className={classes.locationSection}>
        <div>
          <div>
            <Can do={[PermissionEnum.LocationView]}>
              <Link
                className={classes.action}
                onClick={() =>
                  props.goToLocationView(props.detail.location?.id)
                }
              >
                {props.detail.location?.name}
              </Link>
            </Can>
            <Can not do={[PermissionEnum.LocationView]}>
              {props.detail.location?.name}
            </Can>
          </div>
          <div className={classes.detailSubText}>
            {`${props.detail.startTime} - ${props.detail.endTime}`}
          </div>
        </div>
      </div>
      <div className={classes.date}>{props.detail.created}</div>
      <div className={classes.substituteSection}>
        <div>
          {props.detail.state === "noSubRequired" && (
            <div className={classes.detailSubText}>{t("Not required")}</div>
          )}
          {props.detail.state !== "noSubRequired" && props.detail.substitute && (
            <div className={classes.subWithPhone}>
              <div>
                <Can do={[PermissionEnum.SubstituteView]}>
                  <Link
                    className={classes.action}
                    onClick={() =>
                      props.goToPersonView(props.detail.substitute?.id)
                    }
                  >
                    {props.detail.substitute.name}
                  </Link>
                </Can>
                <Can not do={[PermissionEnum.EmployeeView]}>
                  {props.detail.substitute.name}
                </Can>
              </div>
              {props.detail.substitute.phone && (
                <div className={classes.subPhoneInfoIcon}>
                  <Tooltip
                    title={props.detail.substitute.phone}
                    placement="top"
                  >
                    <PermDeviceInformationIcon color="primary" />
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
              {props.detail.type === "absence" && (
                <Link
                  className={classes.action}
                  onClick={() => props.goToAbsenceEditAssign(props.detail.id)}
                >
                  {t("Assign")}
                </Link>
              )}
              {props.detail.type === "vacancy" && (
                <Link
                  className={classes.action}
                  onClick={() => props.goToVacancyEditAssign(props.detail.id)}
                >
                  {t("Assign")}
                </Link>
              )}
            </Can>
          )}
          {props.detail.subTimes.map((st, i) => {
            return (
              <div className={classes.detailSubText} key={i}>
                {`${st.startTime} - ${st.endTime}`}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div>
          {props.detail.type === "absence" ? (
            <Link
              className={classes.action}
              onClick={() => props.goToAbsenceEdit(props.detail.id)}
            >{`#${props.detail.id}`}</Link>
          ) : (
            <Link
              className={classes.action}
              onClick={() => props.goToVacancyEdit(props.detail.id)}
            >{`#V${props.detail.id}`}</Link>
          )}
        </div>
        {props.detail.assignmentId && (
          <div
            className={classes.detailSubText}
          >{`#C${props.detail.assignmentId}`}</div>
        )}
      </div>
      <div>
        <ActionMenu options={props.rowActions} />
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      alignItems: "stretch",
    },
  },
  employeeSection: {
    display: "flex",
    flex: 7,
  },
  locationSection: {
    display: "flex",
    flex: 7,
  },
  reasonSection: {
    display: "flex",
    flex: 4,
  },
  substituteSection: {
    display: "flex",
    flex: 6,
  },
  date: {
    flex: 4,
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
