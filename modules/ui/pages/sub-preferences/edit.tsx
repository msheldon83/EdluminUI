import * as React from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { LinkHeader } from "ui/components/link-headers/base";
import { Section } from "ui/components/section";
import { Filters } from "./components/filters";
import { useMyUserAccess } from "reference-data/my-user-access";
import { SubPreferencesEditUI } from "./edit-ui";
import { SubPreferencesRoute } from "ui/routes/sub-preferences";

type Props = {};

export const SubPreferencesEditPage: React.FC<Props> = props => {
  const { t } = useTranslation();

  const userAccess = useMyUserAccess();
  const userId = userAccess?.me?.user?.id;

  const [orgId, setOrgId] = React.useState<string>("");
  const [orgName, setOrgName] = React.useState<string>("");
  const [orgUserId, setOrgUserId] = React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");

  if (!userId) {
    return <></>;
  }

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
        <SubPreferencesEditUI
          {...{ userId, orgId, orgName, orgUserId, search }}
        />
      </Section>
    </>
  );
};
