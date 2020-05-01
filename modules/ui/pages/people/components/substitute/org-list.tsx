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
  orgs: Maybe<Pick<Organization, "otherOrganization">>[] | null;
};

export const OrganizationList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PersonViewRoute);

  const orgs = props?.orgs;

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
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12} sm={6} lg={6}>
              {orgs?.length === 0 ? (
                <div>{t("No related districts")}</div>
              ) : (
                orgs?.map((n, i) => (
                  <div key={i}>{n?.otherOrganization?.name}</div>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
