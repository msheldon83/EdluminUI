import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Maybe, Organization } from "graphql/server-types.gen";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  orgs: Maybe<Pick<Organization, "name">>[] | null;
};

export const OrganizationList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  const orgs = props?.orgs;

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Districts")}
          action={{
            text: t("Edit"),
            visible: !props.editing,
            execute: () => {
              const editSettingsUrl = "/"; //TODO figure out the URL for editing
              history.push(editSettingsUrl);
            },
          }}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12} sm={6} lg={6}>
              {orgs?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                orgs?.map((n, i) => <div key={i}>{n?.name}</div>)
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
