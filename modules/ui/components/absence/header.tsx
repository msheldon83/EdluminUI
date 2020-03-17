import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography, makeStyles } from "@material-ui/core";

type Props = {
  employeeName: string;
  pageHeader: string;
  actingAsEmployee?: boolean | undefined;
  onCancel?: () => void;
  isForVacancy?: boolean;
};

export const AbsenceHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h5">{props.pageHeader}</Typography>
      {!props.actingAsEmployee && (
        <Typography variant="h1">{props.employeeName}</Typography>
      )}
      {props.onCancel && (
        <div className={classes.confAndReturnContainer}>
          <div>
            <Button variant="outlined" onClick={props.onCancel}>
              {props.isForVacancy
                ? t("Back to Vacancy Details")
                : t("Back to Absence Details")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  confAndReturnContainer: {
    display: "flex",
    marginBottom: theme.spacing(2),
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  selectButton: {
    color: theme.customColors.blue,
  },
}));
