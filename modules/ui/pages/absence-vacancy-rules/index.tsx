import * as React from "react";
import { ShowErrors } from "ui/components/error-helpers";
import { EditAbsenceVacancyRules } from "./edit";
import { useSnackbar } from "hooks/use-snackbar";
import { OrganizationUpdateInput, FeatureFlag } from "graphql/server-types.gen";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { AbsenceVacancyRulesRoute } from "ui/routes/absence-vacancy/rules";
import { GetOrgConfig } from "./graphql/get-org-config.gen";
import { useRouteParams } from "ui/routes/definition";

export const AbsenceVacancyRules: React.FC<{}> = props => {
  const params = useRouteParams(AbsenceVacancyRulesRoute);
  const { openSnackbar } = useSnackbar();

  const [updateOrgConfig] = useMutationBundle(UpdateOrgConfig, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const update = async (orgConfig: OrganizationUpdateInput) => {
    const result = await updateOrgConfig({
      variables: {
        organization: {
          ...orgConfig,
        },
      },
    });

    return result?.data;
  };

  return (
    <>
      <EditAbsenceVacancyRules />
    </>
  );
};
