import * as React from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { Filters } from "./components/filters";
import { SubSchoolPreferencesEditUI } from "./edit-ui";

type Props = {};

export const SubSchoolPreferencesEditPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const [orgId, setOrgId] = React.useState<string>("");
  const [orgUserId, setOrgUserId] = React.useState<string>("");
  const [search, setSearch] = React.useState<string>("");

  return (
    <>
      <PageTitle title={t("School Preferences")} />
      <Section>
        <Typography variant="h5">
          {search ? `"${search}"` : t("All Schools")}
        </Typography>
        <Filters
          userId={""}
          {...{ orgId, setOrgId, orgUserId, setOrgUserId, search, setSearch }}
        />
      </Section>
    </>
  );
};
