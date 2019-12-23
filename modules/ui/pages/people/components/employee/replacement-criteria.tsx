import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Maybe, Endorsement } from "graphql/server-types.gen";

type Props = {
  editing: string | null;
  replacementCriteria?: Maybe<{
    mustHave?: Maybe<Pick<Endorsement, "name">>[] | null;
    mustNotHave?: Maybe<Pick<Endorsement, "name">>[] | null;
    preferToHave?: Maybe<Pick<Endorsement, "name">>[] | null;
    preferToNotHave?: Maybe<Pick<Endorsement, "name">>[] | null;
  }> | null;
};

export const ReplacementCriteria: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  const replacementCriteria = props.replacementCriteria;

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Replacement criteria")}
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
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Substitutes must have")}</Typography>
              {replacementCriteria?.mustHave?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                replacementCriteria?.mustHave?.map((n, i) => (
                  <div key={i}>{n?.name}</div>
                ))
              )}
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">
                {t("Prefer that substitutes have")}
              </Typography>
              {replacementCriteria?.preferToHave?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                replacementCriteria?.preferToHave?.map((n, i) => (
                  <div key={i}>{n?.name}</div>
                ))
              )}
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">
                {t("Substitutes must not have")}
              </Typography>
              {replacementCriteria?.mustNotHave?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                replacementCriteria?.mustNotHave?.map((n, i) => (
                  <div key={i}>{n?.name}</div>
                ))
              )}
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">
                {t("Prefer that subsittutes not have")}
              </Typography>
              {replacementCriteria?.preferToNotHave?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                replacementCriteria?.preferToNotHave?.map((n, i) => (
                  <div key={i}>{n?.name}</div>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
