import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "hooks/use-snackbar";
import { PageTitle } from "ui/components/page-title";
import { OrganizationUpdateInput, TimeZone } from "graphql/server-types.gen";
import { GeneralSettingsRoute } from "ui/routes/general-settings";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  organization: {
    id: string;
    rowVersion: string;
    name: string;
    timeZoneId: string;
    externalId?: string | null;
  };
  onUpdateOrg: (updatedOrg: OrganizationUpdateInput) => Promise<any>;
};

export const EditGeneralSettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(GeneralSettingsRoute);

  return (
    <>
      <PageTitle title={`${params.organizationId} ${t("General Settings")}`} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
