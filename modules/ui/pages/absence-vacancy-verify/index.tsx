import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { AbsenceVacancyVerifyRoute } from "ui/routes/absence-vacancy-verify";
import { useRouteParams } from "ui/routes/definition";
import { Button } from "@material-ui/core";

type Props = {};

export const AbsenceVacancyVerify: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(AbsenceVacancyVerifyRoute);

  const [triggerError, setTriggerError] = React.useState(false);

  if (triggerError) {
    throw Error("error!");
  }

  return (
    <>
      <PageTitle
        title={`${params.organizationId} ${t("Absence & Vacancy Verify")}`}
      />
      {__DEV__ && (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setTriggerError(true);
          }}
        >
          Trigger Error
        </Button>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
