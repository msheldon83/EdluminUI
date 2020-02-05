import * as React from "react";
import { makeStyles, Button, Typography } from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import { useTranslation } from "react-i18next";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "../auth/can";
import { canRemoveSub } from "helpers/permissions";
import { OrgUserPermissions } from "ui/components/auth/types";

type Props = {
  employeeId: string;
  employeeName: string;
  subText?: string;
  assignmentId?: string;
  assignmentRowVersion?: string;
  assignmentStartDate: Date;
  onRemove?: (
    employeeId: string,
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => void;
  disableReplacementInteractions?: boolean;
};

export const AssignedSub: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <div className={classes.details}>
        <AccountCircleOutlined fontSize="large" />
        <div className={classes.name}>
          <Typography variant="h6">{props.employeeName}</Typography>
          {props.subText && (
            <div className={classes.subText}>{props.subText}</div>
          )}
        </div>
      </div>
      {props.assignmentId === undefined ? (
        <></>
      ) : (
        <div>{t("#C") + props.assignmentId}</div>
      )}
      <div>
        {props.onRemove && (
          <Can
            do={(
              permissions: OrgUserPermissions[],
              isSysAdmin: boolean,
              orgId?: string
            ) =>
              canRemoveSub(
                props.assignmentStartDate,
                permissions,
                isSysAdmin,
                orgId
              )
            }
          >
            <Button
              disabled={props.disableReplacementInteractions}
              className={classes.removeButton}
              variant="outlined"
              onClick={() => {
                if (props.onRemove) {
                  props.onRemove(
                    props.employeeId,
                    props.assignmentId,
                    props.assignmentRowVersion
                  );
                }
              }}
            >
              {t("Remove")}
            </Button>
          </Can>
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    padding: theme.spacing(2),
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#ECF9F3",
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderRadius: theme.typography.pxToRem(4),
  },
  details: {
    display: "flex",
    alignItems: "center",
  },
  name: {
    marginLeft: theme.spacing(2),
  },
  subText: {
    fontSize: theme.typography.pxToRem(12),
  },
  removeButton: {
    textDecoration: "uppercase",
  },
}));
