import { makeStyles, Typography, Button, Divider } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { Can } from "ui/components/auth/can";
import { canAssignSub } from "helpers/permissions";

type Props = {
  assignmentStartTime: Date;
  onAssignClick?: () => void;
  disableActions?: boolean;
};

export const UnfilledBanner: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { onAssignClick, assignmentStartTime, disableActions = false } = props;

  return (
    <>
      <Divider className={classes.divider} />
      <div className={classes.unfilled}>
        <Typography variant={"h6"}>{t("Unfilled")}</Typography>
        {onAssignClick && (
          <Can
            do={(
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string,
              forRole?: Role | null | undefined
            ) =>
              canAssignSub(
                assignmentStartTime,
                permissions,
                isSysAdmin,
                orgId,
                forRole
              )
            }
          >
            <Button
              variant="outlined"
              onClick={onAssignClick}
              disabled={disableActions}
              className={classes.assignButton}
            >
              {t("Assign")}
            </Button>
          </Can>
        )}
      </div>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  unfilled: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    color: theme.customColors.darkRed,
    marginLeft: theme.spacing(8),
  },
  divider: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  assignButton: {
    marginRight: theme.typography.pxToRem(5),
  },
}));
