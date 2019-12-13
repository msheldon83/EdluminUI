import * as React from "react";
import { makeStyles, Button, Typography } from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import { useTranslation } from "react-i18next";

type Props = {
  employeeId: number;
  employeeName: string;
  subText?: string;
  assignmentId?: string;
  assignmentRowVersion?: string;
  onRemove?: (
    employeeId: number,
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
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
      <div>
        {props.onRemove && (
          <Button
            disabled={props.disableReplacementInteractions}
            className={classes.removeButton}
            variant="outlined"
            onClick={async () =>
              await props.onRemove!(
                props.employeeId,
                props.assignmentId,
                props.assignmentRowVersion
              )
            }
          >
            {t("Remove")}
          </Button>
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
