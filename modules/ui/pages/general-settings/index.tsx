import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { GetOrganizationById } from "./graphql/get-organization.gen";
import { useHistory } from "react-router";
import { UpdateOrganization } from "./graphql/update-organization.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { OrganizationUpdateInput } from "graphql/server-types.gen";
import { EditGeneralSettings } from "./components/edit-settings";
import { GeneralSettingsRoute } from "ui/routes/general-settings";
import { useRouteParams } from "ui/routes/definition";

export const GeneralSettings: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(GeneralSettingsRoute);
  const history = useHistory();

  const [updateOrg] = useMutationBundle(UpdateOrganization, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onUpdateOrg = async (organization: OrganizationUpdateInput) => {
    console.log(organization);
    const response = await updateOrg({
      variables: {
        organization: {
          orgId: organization.orgId,
          rowVersion: organization.rowVersion,
          name: organization.name,
          externalId: organization.externalId,
          timeZoneId: organization.timeZoneId,
        },
      },
    });

    const result = response.data?.organization?.update;
    if (result) {
      //Go to previous page.TODO:
      //history.push(getViewUrl());
    }
  };

  const getOrganization = useQueryBundle(GetOrganizationById, {
    variables: { id: params.organizationId },
  });

  if (getOrganization.state === "LOADING") {
    return <></>;
  }

  const organization = getOrganization?.data?.organization?.byId;

  if (!organization) {
    return <></>;
  }

  return (
    <>
      <EditGeneralSettings
        organization={organization}
        onUpdateOrg={onUpdateOrg}
      />
    </>
  );
};
