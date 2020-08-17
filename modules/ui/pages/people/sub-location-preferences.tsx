import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { SubstituteLocationPreferencesRoute } from "ui/routes/people";
import { LinkHeader } from "ui/components/link-headers/base";
import { Section } from "ui/components/section";
import { Filters } from "./components/location-preference-filters";
import { useQueryBundle } from "graphql/hooks";
import { SubPreferencesEdit } from "ui/components/substitutes/preferences/edit";
import { SubPreferencesRoute } from "ui/routes/sub-preferences";
import { GetOrganizationName } from "./graphql/substitute/get-organization-name.gen";
import { GetSubstituteById } from "./graphql/substitute/get-substitute-by-id.gen";
import { compact } from "lodash-es";
import { PersonLinkHeader } from "ui/components/link-headers/person";

type Props = {};

export const SubstituteLocationPreferencesPage: React.FC<Props> = props => {
  const { t } = useTranslation();

  const params = useRouteParams(SubstituteLocationPreferencesRoute);
  const orgId = params.organizationId;
  const orgUserId = params.orgUserId;
  const [search, setSearch] = React.useState<string>("");
  const getOrgName = useQueryBundle(GetOrganizationName, {
    variables: {
      id: orgId,
    },
    skip: !orgId,
  });
  const getSub = useQueryBundle(GetSubstituteById, {
    variables: { id: params.orgUserId },
  });

  const orgName =
    getOrgName.state == "LOADING"
      ? undefined
      : getOrgName.data.organization?.byId?.name;
  const preferences =
    getSub.state == "LOADING"
      ? undefined
      : compact(
          getSub.data.orgUser?.byId?.substitute?.substituteLocationPreferences
        ).map(p => ({
          preferenceId: p.preferenceId,
          locationId: p.location.id,
        }));

  if (!orgName) {
    return <></>;
  }

  return (
    <>
      <PersonLinkHeader title={t("Edit School Preferences")} params={params} />
      <Section>
        <Filters
          {...{
            search,
            setSearch,
          }}
        />
        <SubPreferencesEdit
          {...{
            orgId,
            orgName,
            orgUserId,
            search,
            preferences,
            refetchQueries: ["GetSubstituteById"],
          }}
        />
      </Section>
    </>
  );
};
