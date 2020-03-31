import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { GetOrganizationById } from "./graphql/get-organization.gen";
import { useSnackbar } from "hooks/use-snackbar";
import {
  OrganizationUpdateInput,
  Organization,
} from "graphql/server-types.gen";
import { EditGeneralSettings } from "./components/edit-settings";
import { GeneralSettingsRoute } from "ui/routes/general-settings";
import { useRouteParams } from "ui/routes/definition";

type Props = {};

export const GeneralSettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(GeneralSettingsRoute);

  //GraphQL
  // const [updateOrg] = useMutationBundle(UpdateOrganization, {
  //   onError: error => {
  //     ShowErrors(error, openSnackbar);
  //   },
  // });

  const onUpdateOrg = async (organization: OrganizationUpdateInput) => {
    // await updateOrg({
    //   variables: {
    //     loginEmailChange: {
    //       id: myUser?.id ?? "",
    //       rowVersion: myUser?.rowVersion ?? "",
    //       loginEmail: loginEmail,
    //     },
    //   },
    // });
  };

  const getOrganization = useQueryBundle(GetOrganizationById, {
    variables: { id: params.organizationId },
  });

  if (getOrganization.state === "LOADING") {
    return <></>;
  }

  const organization = getOrganization?.data?.organization?.byId;

  return (
    <>
      <EditGeneralSettings
        organization={organization}
        onUpdateOrg={onUpdateOrg}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
