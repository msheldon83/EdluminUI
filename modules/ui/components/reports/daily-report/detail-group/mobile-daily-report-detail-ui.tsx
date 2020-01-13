import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Checkbox,
  Link,
  Tooltip,
  Collapse,
  IconButton,
} from "@material-ui/core";
import { Detail } from "../helpers";
import clsx from "clsx";
import { ActionMenu } from "ui/components/action-menu";
import InfoIcon from "@material-ui/icons/Info";
import { ExpandMore, ExpandLess } from "@material-ui/icons";
import { useState, useCallback } from "react";
import { not } from "helpers";

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
  rowActions: { name: string; onClick: () => void }[];
};

export const MobileDailyReportDetailUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [showingDetails, setIsShowingDetails] = useState(false);

  const toggleExpandDetails = useCallback(() => setIsShowingDetails(not), [
    setIsShowingDetails,
  ]);
  return (
    <div className={[classes.container, props.className].join(" ")}>
      <div className={classes.group}>
        <div className={classes.employeeSection}>
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

        <div className={classes.absenceReason}>
          <div>{props.detail.absenceReason}</div>
          <div className={classes.detailSubText}>{props.detail.dateRange}</div>
        </div>
        <div className={classes.toggle}>
          <IconButton onClick={toggleExpandDetails}>
            {showingDetails ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
      </div>

      {showingDetails && (
        <Collapse in={showingDetails}>
          <div className={classes.indentedGroup}>
            <div className={classes.item}>
              <div>{props.detail.location?.name}</div>
              <div
                className={classes.detailSubText}
              >{`${props.detail.startTime} - ${props.detail.endTime}`}</div>
            </div>
            <div className={classes.item}>
              <div>{props.detail.created}</div>
            </div>
          </div>

          <div className={classes.indentedGroup}>
            <div className={classes.item}>
              {props.detail.state === "noSubRequired" && (
                <div className={classes.detailSubText}>{t("Not required")}</div>
              )}
              {props.detail.state !== "noSubRequired" &&
                props.detail.substitute && (
                  <div className={classes.subWithPhone}>
                    <div>{props.detail.substitute.name}</div>
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
                  <Link
                    className={classes.action}
                    onClick={() => props.goToAbsenceEdit(props.detail.id)}
                  >
                    {t("Assign")}
                  </Link>
                )}
              {props.detail.subStartTime && props.detail.subEndTime && (
                <div className={classes.detailSubText}>
                  {`${props.detail.subStartTime} - ${props.detail.subEndTime}`}
                </div>
              )}
            </div>
            <div className={classes.item}>
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
            </div>
          </div>
        </Collapse>
      )}
      {/* <div xs={1} className={classes.detailActionsSection}>
        <ActionMenu options={rowActions} />
      </div> */}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: { display: "flex", width: "100%", flexDirection: "column" },
  group: { display: "flex", width: "100%" },
  indentedGroup: {
    display: "flex",
    width: "100%",
    paddingLeft: theme.typography.pxToRem(42),
  },
  employeeSection: {
    display: "flex",
    flex: 6,
  },
  absenceReason: {
    flex: 4,
  },
  toggle: { flex: 1 },
  item: { flex: 6 },
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
