import * as React from "react";
import { useTranslation } from "react-i18next";
import { LinkHeader } from "ui/components/link-headers/base";
import { Section } from "ui/components/section";
import { Filters } from "./components/filters";
import { useMyUserAccess } from "reference-data/my-user-access";
import { SubPreferencesEdit } from "ui/components/substitutes/preferences/edit";
import { SubPreferencesRoute } from "ui/routes/sub-preferences";
import { useQueryBundle } from "graphql/hooks";
import { GetSubPreferences } from "ui/components/substitutes/preferences/graphql/get-sub-preferences.gen";
import { compact } from "lodash-es";

type Props = {};

export const SubPreferencesEditPage: React.FC<Props> = props => {
  const { t } = useTranslation();

  const userAccess = useMyUserAccess();
  const userId = userAccess?.me?.user?.id;

  const [orgId, setOrgId] = React.useState<string>("");
  const [orgName, setOrgName] = React.useState<string>("");
  const [orgUserId, setOrgUserId] = React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");
  const getPreferences = useQueryBundle(GetSubPreferences, {
    variables: { userId: userId!, orgId },
    skip: !userId || orgId.length == 0,
  });

  if (!userId) return <></>;

  const preferences =
    getPreferences.state === "LOADING"
      ? undefined
      : compact(
          getPreferences.data.orgUser?.substituteLocationPreferences ?? []
        );

  return (
    <>
      <LinkHeader
        title={t("Edit School Preferences")}
        to={SubPreferencesRoute.generate({})}
        linkText={t("Done editing")}
      />
      <Section>
        <Filters
          {...{
            orgId,
            setOrgId,
            orgName,
            setOrgName,
            orgUserId,
            setOrgUserId,
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
            refetchQueries: ["GetSubPreferences"],
          }}
        />
      </Section>
    </>
  );
};
