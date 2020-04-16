import {
  Checkbox,
  Grid,
  Link,
  makeStyles,
  Tooltip,
  Chip,
} from "@material-ui/core";
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
import { EmployeeLink, SubstituteLink } from "ui/components/links/people"
import { LocationLink } from "ui/components/links/locations"

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
  orgId: string;
  goToAbsenceEdit: (absenceId: string) => void;
  goToAbsenceEditAssign: (absenceId: string) => void;
  goToVacancyEdit: (absenceId: string) => void;
  goToVacancyEditAssign: (absenceId: string) => void;
  hideCheckbox: boolean;
  isChecked: boolean;
  rowActions: {
    name: string;
    onClick: () => void;
    permissions?: CanDo;
  }[];
  vacancyDate?: string;
};

export const DailyReportDetailUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const closedSpan = (c: React.ReactNode) => (
    <span className={props.detail.isClosed ? classes.closedText : ""}>
      c
    </span>
  );

  return (
    <div className={[classes.container, props.className].join(" ")}>
      {!props.detail.isClosed && (
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
      )}
      {props.detail.isClosed && (
        <div className={classes.closedSection}>
          <Chip label={t("Closed")} />
        </div>
      )}
      <div className={classes.locationSection}>
        <div>
          {props.detail.type === "absence" ? (
            <>
              <div>
                <EmployeeLink orgId={props.orgId} orgUserId={props.detail.employee?.id} linkClass={classes.action} cannotWrapper={closedSpan}>
                  {props.detail.employee?.name}
                </EmployeeLink>
              </div>
              <div className={classes.detailSubText}>
                <span
                  className={props.detail.isClosed ? classes.closedText : ""}
                >
                  {props.detail.position?.name}
                </span>
              </div>
            </>
          ) : (
            <div>
              <span
                className={props.detail.isClosed ? classes.closedText : ""}
              >{`${t("Vacancy")}: ${props.detail.position?.name}`}</span>
            </div>
          )}
        </div>
      </div>
      <div className={classes.reasonSection}>
        <div>
          <div>
            {props.detail.type === "absence" ? (
              <span className={props.detail.isClosed ? classes.closedText : ""}>
                {props.detail.absenceReason}
              </span>
            ) : (
              <span className={props.detail.isClosed ? classes.closedText : ""}>
                {props.detail.vacancyReason}
              </span>
            )}
          </div>
          <div className={classes.detailSubText}>
            <span className={props.detail.isClosed ? classes.closedText : ""}>
              {props.vacancyDate ? props.vacancyDate : props.detail.dateRange}
            </span>
          </div>
        </div>
      </div>
      <div className={classes.locationSection}>
        <div>
          <div>
            <LocationLink orgId={props.orgId} locationId={props.detail.location?.id} linkClass={classes.action} cannotWrapper={closedSpan}>
              {props.detail.location?.name}
            </LocationLink>
          </div>
          <div className={classes.detailSubText}>
            <span
              className={props.detail.isClosed ? classes.closedText : ""}
            >{`${props.detail.startTime} - ${props.detail.endTime}`}</span>
          </div>
        </div>
      </div>
      <div className={classes.date}>
        <span className={props.detail.isClosed ? classes.closedText : ""}>
          {props.detail.created}
        </span>
      </div>
      <div className={classes.substituteSection}>
        <div>
          {props.detail.state === "noSubRequired" && (
            <div className={classes.detailSubText}>
              <span className={props.detail.isClosed ? classes.closedText : ""}>
                {t("Not required")}
              </span>
            </div>
          )}
          {props.detail.state !== "noSubRequired" && props.detail.substitute && (
            <div className={classes.subWithPhone}>
              <div>
                <SubstituteLink orgId={props.orgId} orgUserId={props.detail.substitute.id} linkClass={classes.action}>
                  {props.detail.substitute.name}
                </SubstituteLink>
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
          {props.detail.isClosed && (
            <span className={classes.closedText}>{t("Not required")}</span>
          )}
          {props.detail.state !== "noSubRequired" &&
            !props.detail.isClosed &&
            !props.detail.substitute && (
              <Can
                do={(
                  permissions: OrgUserPermissions[],
                  isSysAdmin: boolean,
                  orgId?: string
                ) =>
                  canAssignSub(
                    props.detail.date,
                    permissions,
                    isSysAdmin,
                    orgId
                  )
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
    alignItems: "left",
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
  closedSection: {
    display: "flex",
    flex: 3,
    marginRight: theme.spacing(),
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
  closedText: {
    fontStyle: "italic",
    color: "#9E9E99",
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
