import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography, makeStyles } from "@material-ui/core";

type Props = {
  absenceId?: string;
  userIsAdmin: boolean;
  employeeName: string;
  pageHeader: string;
  onCancel: () => void;
};

export const AbsenceHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.header}>
      <div>
        <Typography variant="h5">{props.pageHeader}</Typography>
        {props.userIsAdmin && (
          <Typography variant="h1">{props.employeeName}</Typography>
        )}
      </div>
      <div className={classes.confAndReturnContainer}>
        <div>
          <Button variant="outlined" onClick={props.onCancel}>
            {t("Back to Absence Details")}
          </Button>
        </div>
        <div>
          {props.absenceId && (
            <Typography variant="h6">
              {t("Confirmation")} #{props.absenceId}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
  confAndReturnContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  selectButton: {
    color: theme.customColors.blue,
  },
}));
