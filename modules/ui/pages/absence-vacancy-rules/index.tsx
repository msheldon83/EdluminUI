import * as React from "react";
import { ShowErrors } from "ui/components/error-helpers";
import { EditAbsenceVacancyRules } from "./edit";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "hooks/use-snackbar";
import { OrganizationUpdateInput } from "graphql/server-types.gen";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { AbsenceVacancyRulesRoute } from "ui/routes/absence-vacancy/rules";
import { GetOrgConfigById } from "./graphql/get-org-config-by-id.gen";
import { UpdateOrgConfig } from "./graphql/update-org-config.gen";
import { useRouteParams } from "ui/routes/definition";
import { SettingsRoute } from "ui/routes/settings";

export const AbsenceVacancyRules: React.FC<{}> = props => {
  const params = useRouteParams(AbsenceVacancyRulesRoute);
  const history = useHistory();
  const { openSnackbar } = useSnackbar();

  const [updateOrgConfig] = useMutationBundle(UpdateOrgConfig, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getOrgConfig = useQueryBundle(GetOrgConfigById, {
    variables: {
      id: params.organizationId,
    },
  });

  if (getOrgConfig.state === "LOADING") {
    return <></>;
  }
  const organization: any | undefined =
    getOrgConfig?.data?.organization?.byId ?? undefined;

  const update = async (orgConfig: OrganizationUpdateInput) => {
    const result = await updateOrgConfig({
      variables: {
        orgConfig: {
          ...orgConfig,
        },
      },
    });

    return result?.data;
  };

  return (
    <>
      <EditAbsenceVacancyRules
        organization={organization}
        onCancel={() => {
          const url = SettingsRoute.generate(params);
          history.push(url);
        }}
        onSubmit={async (orgConfig: OrganizationUpdateInput) => {
          const result = await update(orgConfig);
          if (result) {
            const url = SettingsRoute.generate(params);
            history.push(url);
          }
        }}
      />
    </>
  );
};
