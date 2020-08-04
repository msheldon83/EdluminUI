import {
  makeStyles,
  Tooltip,
  Chip,
  Button,
  Grid,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ActionMenu } from "ui/components/action-menu";
import { Detail } from "../helpers";
import { CanDo } from "ui/components/auth/types";
import PermDeviceInformationIcon from "@material-ui/icons/PermDeviceInformation";
import { EmployeeLink, SubstituteLink } from "ui/components/links/people";
import { LocationLink } from "ui/components/links/locations";
import { AbsVacLink, AbsVacAssignLink } from "ui/components/links/abs-vac";
import InfoIcon from "@material-ui/icons/Info";
import { ApprovalStatus } from "graphql/server-types.gen";
import clsx from "clsx";

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
  rowActions: {
    name: string;
    onClick: () => void;
    permissions?: CanDo;
  }[];
  vacancyDate?: string;
  highlighted?: boolean;
  swapMode?: "swapable" | "notswapable";
  swapSubs?: (detail: Detail) => void;
};

export const DailyReportDetailUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const inSwapMode = props.selectedDetails.length > 0;

  return (
    <div
      className={clsx(
        props.highlighted ? classes.highlighted : undefined,
        classes.container,
        props.className
      )}
    >
      {props.detail.isClosed && (
        <div className={classes.closedSection}>
          <Chip label={t("Closed")} />
        </div>
      )}
      <div className={classes.employeeSection}>
        <div>
          {props.detail.type === "absence" ? (
            <>
              <div>
                {props.highlighted || inSwapMode ? (
                  props.detail.employee?.name
                ) : (
                  <EmployeeLink
                    orgUserId={props.detail.employee?.id}
                    linkClass={classes.action}
                    textClass={props.detail.isClosed ? classes.closedText : ""}
                  >
                    {props.detail.employee?.name}
                  </EmployeeLink>
                )}
              </div>
              <div className={props.highlighted ? "" : classes.detailSubText}>
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
            <span className={props.detail.isClosed ? classes.closedText : ""}>
              {props.detail.type === "absence"
                ? props.detail.absenceReason
                : props.detail.vacancyReason}
            </span>
          </div>
          <div className={props.highlighted ? "" : classes.detailSubText}>
            <span className={props.detail.isClosed ? classes.closedText : ""}>
              {props.vacancyDate ?? props.detail.dateRange}
            </span>
          </div>
        </div>
      </div>
      <div className={classes.locationSection}>
        <div>
          <div>
            {!props.detail.locations?.length ? (
              undefined
            ) : props.detail.locations.length > 1 ? (
              t("Multiple")
            ) : props.highlighted || inSwapMode ? (
              props.detail.locations[0].name
            ) : (
              <LocationLink
                locationId={props.detail.locations[0].id}
                linkClass={classes.action}
                textClass={props.detail.isClosed ? classes.closedText : ""}
              >
                {props.detail.locations[0].name}
              </LocationLink>
            )}
          </div>
          <div className={props.highlighted ? "" : classes.detailSubText}>
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
            <div className={props.highlighted ? "" : classes.detailSubText}>
              <span className={props.detail.isClosed ? classes.closedText : ""}>
                {t("Not required")}
              </span>
            </div>
          )}
          {props.detail.state !== "noSubRequired" && props.detail.substitute && (
            <div className={classes.subWithPhone}>
              <div>
                {props.highlighted || inSwapMode ? (
                  props.detail.substitute.name
                ) : (
                  <SubstituteLink
                    orgUserId={props.detail.substitute.id}
                    linkClass={classes.action}
                  >
                    {props.detail.substitute.name}
                  </SubstituteLink>
                )}
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
            !props.detail.substitute &&
            !props.highlighted &&
            !inSwapMode && (
              <AbsVacAssignLink
                absVacId={props.detail.id}
                absVacType={props.detail.type}
                absVacDate={props.detail.date}
              >
                {t("Assign")}
              </AbsVacAssignLink>
            )}
          {((!props.detail.substitute && props.highlighted) ||
            (!props.detail.substitute && inSwapMode)) && <>{t("Unassigned")}</>}
          {props.detail.subTimes.map((st, i) => {
            return (
              <div
                className={props.highlighted ? "" : classes.detailSubText}
                key={i}
              >
                {`${st.startTime} - ${st.endTime}`}
              </div>
            );
          })}
        </div>
      </div>
      <div className={classes.confirmationNumbers}>
        <div>
          <div>
            <AbsVacLink
              absVacId={props.detail.id}
              absVacType={props.detail.type}
              linkClass={classes.action}
              disabled={props.highlighted || inSwapMode}
            />
          </div>
          {props.detail.assignmentId && (
            <div
              className={props.highlighted ? "" : classes.detailSubText}
            >{`#C${props.detail.assignmentId}`}</div>
          )}
        </div>
      </div>
      <div className={classes.approvalChip}>
        {(props.detail.approvalStatus === ApprovalStatus.ApprovalRequired ||
          props.detail.approvalStatus === ApprovalStatus.PartiallyApproved) && (
          <Chip label={t("Pending")} className={classes.pendingApprovalChip} />
        )}
      </div>
      {!inSwapMode && (
        <div className={classes.actionCell}>
          <ActionMenu options={props.rowActions} />
        </div>
      )}
      {inSwapMode &&
        props.swapMode === "swapable" &&
        props.swapSubs &&
        !props.highlighted && (
          <div className={classes.actionCell}>
            <Button
              variant="contained"
              onClick={e => {
                e.stopPropagation();
                if (props.swapSubs) {
                  props.swapSubs(props.detail);
                }
              }}
            >
              {t("Swap")}
            </Button>
          </div>
        )}
      {inSwapMode &&
        props.swapMode === "notswapable" &&
        props.swapSubs &&
        !props.highlighted && (
          <div className={classes.actionCell}>
            <Tooltip
              title={
                <div className={classes.tooltip}>
                  {props.detail.isMultiDay
                    ? t(
                        "Swapping subs for multiday assignments is not supported.”"
                      )
                    : props.detail.state === "noSubRequired"
                    ? t("A substitute is not required.")
                    : t("Can not swap subs.")}
                </div>
              }
              placement="right-start"
            >
              <InfoIcon
                color="primary"
                style={{
                  marginLeft: "22px",
                }}
              />
            </Tooltip>
          </div>
        )}
      {props.highlighted && <div className={classes.actionCell}></div>}
      {props.detail.locations && props.detail.locations.length > 1 && (
        <div className={classes.extraLocations}>
          {props.detail.locations.map((l, i) => (
            <Typography
              key={l.id ?? i}
              className={props.highlighted ? "" : classes.detailSubText}
            >
              {l.times ? `${l.times.startTime} - ${l.times.endTime} @ ` : "@ "}
              <LocationLink
                locationId={l.id}
                linkClass={classes.action}
                textClass={props.detail.isClosed ? classes.closedText : ""}
              >
                {l.name}
              </LocationLink>
            </Typography>
          ))}
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    display: "grid",
    width: "100%",
    gridTemplate: `
      "closed employee reason location       date           substitute     confirmation   approval       action        " auto
      ".      .        .      extraLocations extraLocations extraLocations extraLocations extraLocations extraLocations" auto
      / 48px   3fr      3fr    3fr            3fr            3fr            3fr           72px           48px
    `,
    columnGap: theme.spacing(1),
  },
  employeeSection: {
    gridArea: "employee",
  },
  locationSection: {
    gridArea: "location",
  },
  closedSection: {
    gridArea: "closed",
    justifySelf: "end",
  },
  reasonSection: {
    gridArea: "reason",
  },
  substituteSection: {
    gridArea: "substitute",
  },
  date: {
    gridArea: "date",
  },
  approvalChip: {
    gridArea: "approval",
  },
  extraLocations: {
    gridArea: "extraLocations",
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
  confirmationNumbers: {
    //width: "120px",
    gridArea: "confirmation",
  },
  action: {
    cursor: "pointer",
  },
  actionCell: {
    //width: theme.typography.pxToRem(85),
    gridArea: "action",
    "@media print": {
      display: "none",
    },
  },
  highlighted: {
    color: `${theme.customColors.white} !important`,
    backgroundColor: `${theme.customColors.darkBlueGray} !important`,
    alignItems: "center",
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  pendingApprovalChip: {
    backgroundColor: theme.customColors.yellow4,
    color: theme.palette.text.primary,
  },
}));
