import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Tooltip,
  Collapse,
  IconButton,
  Button,
  useMediaQuery,
  Chip,
} from "@material-ui/core";
import { Detail } from "../helpers";
import clsx from "clsx";
import InfoIcon from "@material-ui/icons/Info";
import { ExpandMore, ExpandLess } from "@material-ui/icons";
import { useState, useCallback } from "react";
import { not } from "helpers";
import { Can } from "ui/components/auth/can";
import { CanDo, OrgUserPermissions, Role } from "ui/components/auth/types";
import { EmployeeLink, SubstituteLink } from "ui/components/links/people";
import { LocationLink } from "ui/components/links/locations";
import { AbsVacLink, AbsVacAssignLink } from "ui/components/links/abs-vac";
import { ApprovalStatus } from "graphql/server-types.gen";

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
  showDetails?: boolean;
};

export const MobileDailyReportDetailUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isPrinting = useMediaQuery("@media print");
  const [showingDetailsState, setIsShowingDetails] = useState(
    props.showDetails ?? false
  );
  const showingDetails = isPrinting || showingDetailsState;

  const inSwapMode = props.selectedDetails.length > 0;

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

  const condClosed = props.highlighted
    ? ""
    : props.detail.isClosed
    ? classes.closedText
    : "";
  return (
    <div
      className={
        props.highlighted
          ? [classes.highlighted, classes.container, props.className].join(" ")
          : [classes.container, props.className].join(" ")
      }
    >
      <div className={classes.group}>
        <div className={classes.item}>
          {props.detail.type === "absence" ? (
            <>
              <div>
                {props.highlighted || inSwapMode ? (
                  props.detail.employee?.name
                ) : (
                  <EmployeeLink
                    orgUserId={props.detail.employee?.id}
                    linkClass={classes.action}
                    textClass={condClosed}
                  >
                    {props.detail.employee?.name}
                  </EmployeeLink>
                )}
              </div>
              <div className={props.highlighted ? "" : classes.detailSubText}>
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
            <div className={props.highlighted ? "" : classes.detailSubText}>
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
            <div className={classes.item}>
              <div>
                {props.highlighted || inSwapMode ? (
                  props.detail.location?.name
                ) : (
                  <LocationLink
                    locationId={props.detail.location?.id}
                    linkClass={classes.action}
                    textClass={condClosed}
                  >
                    {props.detail.location?.name}
                  </LocationLink>
                )}
              </div>
              <div className={props.highlighted ? "" : classes.detailSubText}>
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
            <div className={classes.item}>
              {props.detail.state === "noSubRequired" && (
                <div className={props.highlighted ? "" : classes.detailSubText}>
                  <span className={condClosed}>{t("Sub not required")}</span>
                </div>
              )}
              {props.detail.state !== "noSubRequired" &&
                props.detail.substitute && (
                  <div className={classes.subWithPhone}>
                    <div>
                      {props.highlighted || inSwapMode ? (
                        props.detail.substitute.name
                      ) : (
                        <SubstituteLink
                          orgUserId={props.detail.substitute?.id}
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
                (!props.detail.substitute && inSwapMode)) && (
                <>{t("Unassigned")}</>
              )}
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
            <div className={classes.item}>
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
          {props.detail.approvalStatus === ApprovalStatus.Pending && (
            <Chip
              label={t("Pending")}
              className={classes.pendingApprovalChip}
            />
          )}
          {!props.highlighted && !inSwapMode ? actionButtons : <></>}
        </Collapse>
      )}

      {inSwapMode &&
        props.swapMode === "swapable" &&
        props.swapSubs &&
        !props.highlighted && (
          <div className={classes.actionButtons}>
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
          <div className={classes.actionButtons}>
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
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: { display: "flex", width: "100%", flexDirection: "column" },
  group: { display: "flex", width: "100%" },
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
  hidden: {
    visibility: "hidden",
  },
  closedText: {
    fontStyle: "italic",
    color: "#9E9E99",
  },
  highlighted: {
    color: `${theme.customColors.white} !important`,
    backgroundColor: `${theme.customColors.darkBlueGray} !important`,
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  pendingApprovalChip: {
    backgroundColor: theme.customColors.yellow4,
    color: theme.palette.text.primary,
  },
}));
