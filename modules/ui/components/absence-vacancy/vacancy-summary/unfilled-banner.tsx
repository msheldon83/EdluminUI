import { makeStyles, Typography, Button } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OrgUserPermissions } from "ui/components/auth/types";
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
    <div className={classes.unfilled}>
      <Typography variant={"h6"}>{t("Unfilled")}</Typography>
      {onAssignClick && (
        <Can
          do={(
            permissions: OrgUserPermissions[],
            isSysAdmin: boolean,
            orgId?: string
          ) =>
            canAssignSub(assignmentStartTime, permissions, isSysAdmin, orgId)
          }
        >
          <Button
            variant="text"
            onClick={onAssignClick}
            disabled={disableActions}
          >
            {t("Assign")}
          </Button>
        </Can>
      )}
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  unfilled: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: theme.customColors.lighterGray,
    color: theme.customColors.darkRed,
  },
}));
