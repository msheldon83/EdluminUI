import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography, makeStyles } from "@material-ui/core";
import { EmployeeLink } from "ui/components/links/people";

type Props = {
  pageHeader: string;
  subHeader?: string | JSX.Element;
  onCancel?: () => void;
  isForVacancy?: boolean;
};

export const AbsenceVacancyHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.confAndReturnContainer}>
      <div>
        <Typography variant="h5">{props.pageHeader}</Typography>
        {!props.subHeader && (
          <Typography variant="h1">{props.subHeader}</Typography>
        )}
      </div>

      {props.onCancel && (
        <div>
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectButton: {
    color: theme.customColors.blue,
  },
}));
