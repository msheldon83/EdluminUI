import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { Maybe, Endorsement, PermissionEnum } from "graphql/server-types.gen";
import {
  PersonViewRoute,
  PeopleReplacementCriteriaEditRoute,
} from "ui/routes/people";

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
  const params = useRouteParams(PersonViewRoute);

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
              const editSettingsUrl = PeopleReplacementCriteriaEditRoute.generate(
                params
              );
              history.push(editSettingsUrl);
            },
            permissions: [PermissionEnum.EmployeeSave],
          }}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Substitutes must have")}</Typography>
              {replacementCriteria === undefined ||
              replacementCriteria?.mustHave?.length === 0 ? (
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
              {replacementCriteria === undefined ||
              replacementCriteria?.preferToHave?.length === 0 ? (
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
              {replacementCriteria === undefined ||
              replacementCriteria?.mustNotHave?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                replacementCriteria?.mustNotHave?.map((n, i) => (
                  <div key={i}>{n?.name}</div>
                ))
              )}
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">
                {t("Prefer that substitutes not have")}
              </Typography>
              {replacementCriteria === undefined ||
              replacementCriteria?.preferToNotHave?.length === 0 ? (
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
