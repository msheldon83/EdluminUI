import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Checkbox,
  Link,
  Tooltip,
  Collapse,
  IconButton,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import { Detail } from "../helpers";
import clsx from "clsx";
import InfoIcon from "@material-ui/icons/Info";
import { ExpandMore, ExpandLess } from "@material-ui/icons";
import { useState, useCallback } from "react";
import { not } from "helpers";
import { canAssignSub } from "helpers/permissions";
import { Can } from "ui/components/auth/can";
import { CanDo, OrgUserPermissions, Role } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { EmployeeLink, SubstituteLink } from "ui/components/links/people";
import { LocationLink } from "ui/components/links/locations";
import { AbsVacLink, AbsVacAssignLink } from "ui/components/links/abs-vac";

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
  hideCheckbox: boolean;
  isChecked: boolean;
  rowActions: {
    name: string;
    onClick: () => void;
    permissions?: CanDo;
  }[];
  vacancyDate?: string;
};

export const MobileDailyReportDetailUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isPrinting = useMediaQuery("@media print");
  const [showingDetailsState, setIsShowingDetails] = useState(false);
  const showingDetails = isPrinting || showingDetailsState;

  const toggleExpandDetails = useCallback(() => setIsShowingDetails(not), [
    setIsShowingDetails,
  ]);

  const actionButtons = (
    <div className={classes.actionButtons}>
      {props.rowActions.map(a =>
        a.permissions ? (
          <Can do={a.permissions} key={a.name}>
            <Button
              variant="outlined"
              className={classes.button}
              onClick={a.onClick}
            >
              {a.name}
            </Button>
          </Can>
        ) : (
          <Button
            key={a.name}
            variant="outlined"
            className={classes.button}
            onClick={a.onClick}
          >
            {a.name}
          </Button>
        )
      )}
    </div>
  );

  const condClosed = props.detail.isClosed ? classes.closedText : "";
  return (
    <div className={[classes.container, props.className].join(" ")}>
      <div className={classes.group}>
        <div className={classes.checkboxSpacing}>
          <Can
            do={(
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string,
              forRole?: Role | null | undefined
            ) =>
              canAssignSub(
                props.detail.date,
                permissions,
                isSysAdmin,
                orgId,
                forRole
              )
            }
          >
            <Checkbox
              color="primary"
              className={clsx({
                [classes.hidden]: props.hideCheckbox,
                [classes.checkbox]: true,
              })}
              checked={!props.detail.isClosed && props.isChecked}
              disabled={props.detail.isClosed}
              indeterminate={props.detail.isClosed}
              onChange={e => {
                props.updateSelectedDetails(props.detail, e.target.checked);
              }}
            />
          </Can>
        </div>
        <div className={classes.item}>
          {props.detail.type === "absence" ? (
            <>
              <div>
                <EmployeeLink
                  orgId={props.detail.orgId}
                  orgUserId={props.detail.employee?.id}
                  linkClass={classes.action}
                  textClass={condClosed}
                >
                  {props.detail.employee?.name}
                </EmployeeLink>
              </div>
              <div className={classes.detailSubText}>
                <span className={condClosed}>
                  {props.detail.position?.name}
                </span>
              </div>
            </>
          ) : (
            <div>
              <span className={condClosed}>
                {`${t("Vacancy")}: ${props.detail.position?.name}`}
              </span>
            </div>
          )}
        </div>

        <div className={classes.itemContainer}>
          <div className={classes.absenceReason}>
            <div>
              <span className={condClosed}>
                {props.detail.type === "absence"
                  ? props.detail.absenceReason
                  : props.detail.vacancyReason}
              </span>
            </div>
            <div className={classes.detailSubText}>
              <span className={condClosed}>
                {props.vacancyDate ?? props.detail.dateRange}
              </span>
            </div>
          </div>
          <div className={classes.toggle}>
            <IconButton onClick={toggleExpandDetails}>
              {showingDetails ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </div>
        </div>
      </div>

      {showingDetails && (
        <Collapse in={showingDetails}>
          <div className={classes.group}>
            <div className={classes.checkboxSpacing} />
            <div className={classes.item}>
              <div>
                <LocationLink
                  orgId={props.detail.orgId}
                  locationId={props.detail.location?.id}
                  linkClass={classes.action}
                  textClass={condClosed}
                >
                  {props.detail.location?.name}
                </LocationLink>
              </div>
              <div className={classes.detailSubText}>
                <span className={condClosed}>
                  {`${props.detail.startTime} - ${props.detail.endTime}`}
                </span>
              </div>
            </div>
            <div className={classes.item}>
              <div>
                <span className={condClosed}>{props.detail.created}</span>
              </div>
            </div>
          </div>

          <div className={classes.group}>
            <div className={classes.checkboxSpacing} />
            <div className={classes.item}>
              {props.detail.state === "noSubRequired" && (
                <div className={classes.detailSubText}>
                  <span className={condClosed}>{t("Sub not required")}</span>
                </div>
              )}
              {props.detail.state !== "noSubRequired" &&
                props.detail.substitute && (
                  <div className={classes.subWithPhone}>
                    <div>
                      <SubstituteLink
                        orgId={props.detail.orgId}
                        orgUserId={props.detail.substitute?.id}
                        linkClass={classes.action}
                      >
                        {props.detail.substitute.name}
                      </SubstituteLink>
                    </div>
                    {props.detail.substitute.phone && (
                      <div className={classes.subPhoneInfoIcon}>
                        <Tooltip
                          title={props.detail.substitute.phone}
                          placement="top"
                        >
                          <InfoIcon color="primary" />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                )}
              {props.detail.isClosed && (
                <span className={classes.closedText}>
                  {t("Sub not required")}
                </span>
              )}
              {props.detail.state !== "noSubRequired" &&
                !props.detail.isClosed &&
                !props.detail.substitute && (
                  <AbsVacAssignLink
                    orgId={props.detail.orgId}
                    absVacId={props.detail.id}
                    absVacType={props.detail.type}
                    absVacDate={props.detail.date}
                  >
                    {t("Assign")}
                  </AbsVacAssignLink>
                )}
              {props.detail.subTimes.map((st, i) => {
                return (
                  <div className={classes.detailSubText} key={i}>
                    {`${st.startTime} - ${st.endTime}`}
                  </div>
                );
              })}
            </div>
            <div className={classes.item}>
              <div>
                <AbsVacLink
                  orgId={props.detail.orgId}
                  absVacId={props.detail.id}
                  absVacType={props.detail.type}
                  linkClass={classes.action}
                />
              </div>
              {props.detail.assignmentId && (
                <div
                  className={classes.detailSubText}
                >{`#C${props.detail.assignmentId}`}</div>
              )}
            </div>
          </div>
          {actionButtons}
        </Collapse>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: { display: "flex", width: "100%", flexDirection: "column" },
  group: { display: "flex", width: "100%" },
  checkboxSpacing: { width: theme.typography.pxToRem(42), flexGrow: 0 },
  absenceReason: {
    flex: 4,
  },
  toggle: { flex: 1, "@media print": { display: "none" } },
  item: { flex: 1 },
  itemContainer: { flex: 1, display: "flex" },
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

  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.spacing(2),
    "@media print": {
      display: "none",
    },
  },
  button: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
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
  closedText: {
    fontStyle: "italic",
    color: "#9E9E99",
  },
}));
