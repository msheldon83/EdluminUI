import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link } from "@material-ui/core";
import { Detail } from "./helpers";
import clsx from "clsx";
import { ActionMenu } from "ui/components/action-menu";

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
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

  return (
    <Grid
      item
      xs={12}
      container
      className={[classes.detail, props.className].join(" ")}
    >
      <Grid item xs={3}>
        <div className={classes.employeeSection}>
          <Checkbox
            color="primary"
            className={clsx({
              [classes.hidden]: hideCheckbox,
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
      <Grid item xs={2}>
        <div>{props.detail.absenceReason}</div>
        <div className={classes.detailSubText}>{props.detail.dateRange}</div>
      </Grid>
      <Grid item xs={2}>
        <div>{props.detail.location?.name}</div>
        <div
          className={classes.detailSubText}
        >{`${props.detail.startTime} - ${props.detail.endTime}`}</div>
      </Grid>
      <Grid item xs={1}>
        <div>{props.detail.created}</div>
      </Grid>
      <Grid item xs={2}>
        {props.detail.state === "noSubRequired" && (
          <div className={classes.detailSubText}>{t("Not required")}</div>
        )}
        {props.detail.state !== "noSubRequired" && props.detail.substitute && (
          <>
            <div>{props.detail.substitute.name}</div>
            <div className={classes.detailSubText}>
              {props.detail.substitute.phone}
            </div>
          </>
        )}
        {props.detail.state !== "noSubRequired" && !props.detail.substitute && (
          <Link className={classes.action}>{t("Assign")}</Link>
        )}
      </Grid>
      <Grid item xs={1}>
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
        <ActionMenu
          options={[
            {
              name: t("Edit"),
              onClick: () => {},
            },
            {
              name: props.detail.substitute ? t("Remove Sub") : t("Assign Sub"),
              onClick: () => {},
            },
          ]}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  detail: {
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  employeeSection: {
    display: "flex",
  },
  detailSubText: {
    color: theme.customColors.edluminSubText,
  },
  detailActionsSection: {
    textAlign: "right",
  },
  action: {
    cursor: "pointer",
  },
  hidden: {
    visibility: "hidden",
  },
}));
