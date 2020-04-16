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
import { CanDo, OrgUserPermissions } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { EmployeeLink, SubstituteLink } from "ui/components/links/people";
import { LocationLink } from "ui/components/links/locations";
import { AbsenceLink } from "ui/components/links/absences";
import { VacancyLink } from "ui/components/links/vacancies";

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
  return (
    <div className={[classes.container, props.className].join(" ")}>
      <div className={classes.group}>
        <div className={classes.checkboxSpacing}>
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
        </div>
        <div className={classes.item}>
          {props.detail.type === "absence" ? (
            <>
              <div>
                <EmployeeLink
                  orgId={props.detail.orgId}
                  orgUserId={props.detail.employee?.id}
                  linkClass={classes.action}
                >
                  {props.detail.employee?.name}
                </EmployeeLink>
              </div>
              <div className={classes.detailSubText}>
                {props.detail.position?.title}
              </div>
            </>
          ) : (
            <div>{props.detail.position?.title}</div>
          )}
        </div>

        <div className={classes.itemContainer}>
          <div className={classes.absenceReason}>
            <div>{props.detail.absenceReason}</div>
            <div className={classes.detailSubText}>
              {props.detail.dateRange}
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
                >
                  {props.detail.location?.name}
                </LocationLink>
              </div>
              <div
                className={classes.detailSubText}
              >{`${props.detail.startTime} - ${props.detail.endTime}`}</div>
            </div>
            <div className={classes.item}>
              <div>{props.detail.created}</div>
            </div>
          </div>

          <div className={classes.group}>
            <div className={classes.checkboxSpacing} />
            <div className={classes.item}>
              {props.detail.state === "noSubRequired" && (
                <div className={classes.detailSubText}>{t("Not required")}</div>
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
              {props.detail.state !== "noSubRequired" &&
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
                    <Link
                      className={classes.action}
                      onClick={() => props.goToAbsenceEdit(props.detail.id)}
                    >
                      {t("Assign")}
                    </Link>
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
            <div className={classes.item}>
              <div>
                {props.detail.type === "absence" ? (
                  <AbsenceLink
                    orgId={props.detail.orgId}
                    absenceId={props.detail.id}
                    linkClass={classes.action}
                  >
                    {`#${props.detail.id}`}
                  </AbsenceLink>
                ) : (
                  <VacancyLink
                    orgId={props.detail.orgId}
                    vacancyId={props.detail.id}
                    linkClass={classes.action}
                  >
                    {`#V${props.detail.id}`}
                  </VacancyLink>
                )}
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
}));
