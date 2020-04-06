import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { GetOrganizationById } from "./graphql/get-organization.gen";
import { useHistory } from "react-router";
import { UpdateOrganization } from "./graphql/update-organization.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { OrganizationUpdateInput } from "graphql/server-types.gen";
import { useRouteParams } from "ui/routes/definition";
import { EditGeneralSettings } from "./components/edit-settings";
import { SettingsRoute } from "ui/routes/settings";

export const GeneralSettings: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(SettingsRoute);
  const history = useHistory();

  const [updateOrg] = useMutationBundle(UpdateOrganization, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onCancel = async () => {
    history.push(SettingsRoute.generate(params));
  };

  const onUpdateOrg = async (organization: OrganizationUpdateInput) => {
    const response = await updateOrg({
      variables: {
        organization: {
          orgId: organization.orgId,
          rowVersion: organization.rowVersion,
          name: organization.name,
          externalId: organization.externalId,
          timeZoneId: organization.timeZoneId,
          config: {
            absenceSubContact: organization.config?.absenceSubContact,
            absenceEmployeeContact: organization.config?.absenceEmployeeContact,
          },
        },
      },
    });

    const result = response.data?.organization?.update;
    if (result) {
      await onCancel();
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
        onCancel={onCancel}
      />
    </>
  );
};
