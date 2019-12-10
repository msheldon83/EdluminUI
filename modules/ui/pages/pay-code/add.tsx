import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { PayCodeAddRoute } from "ui/routes/pay-code";
import { useRouteParams } from "ui/routes/definition";
import { Button } from "@material-ui/core";

type Props = {};

export const PayCodeAddPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(PayCodeAddRoute);

  const [triggerError, setTriggerError] = React.useState(false);

  if (triggerError) {
    throw Error("error!");
  }

  return (
    <>
      <PageTitle title={`${params.organizationId} ${t("Add pay code")}`} />
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
