import * as React from "react";
import { Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Maybe, Organization, PermissionEnum } from "graphql/server-types.gen";
import {
  PeopleSubRelatedOrgsEditRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  editing: string | null;
  orgs: Maybe<Pick<Organization, "name">>[] | null;
};

export const OrganizationList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PersonViewRoute);

  const orgs = props?.orgs?.sort((a, b) =>
    a?.name && b?.name
      ? a.name.toLowerCase() > b.name.toLowerCase()
        ? 1
        : -1
      : 0
  );

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Districts")}
          actions={[
            {
              text: t("Edit"),
              visible: !props.editing,
              execute: () => {
                const editSettingsUrl = PeopleSubRelatedOrgsEditRoute.generate(
                  params
                );
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.SubstituteSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={12}>
            <Grid item xs={12} sm={6} lg={6}>
              {orgs?.length === 0 ? (
                <div>{t("No related districts")}</div>
              ) : (
                orgs?.map((n: any, i: any) => <div key={i}>{n?.name}</div>)
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
