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
  disabled: boolean;
  editing: string | null;
  editable: boolean;
  replacementCriteria?: Maybe<{
    mustHave?: Maybe<Pick<Endorsement, "name">>[] | null;
    mustNotHave?: Maybe<Pick<Endorsement, "name">>[] | null;
    preferToHave?: Maybe<Pick<Endorsement, "name">>[] | null;
    preferToNotHave?: Maybe<Pick<Endorsement, "name">>[] | null;
  }> | null;
  inheritedReplacementCriteria?: Maybe<{
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

  const showEditButton = !props.disabled && !props.editing && props.editable;

  const replacementCriteria = props.replacementCriteria;
  const inheritedReplacementCriteria = props.inheritedReplacementCriteria;

  const mustHaves = replacementCriteria?.mustHave?.map(x => x?.name) ?? [];
  const inheritedMustHaves =
    inheritedReplacementCriteria?.mustHave?.map(x => x?.name) ?? [];
  const deduppedMustHaves = [...new Set(mustHaves.concat(inheritedMustHaves))];

  const mustNotHaves =
    replacementCriteria?.mustNotHave?.map(x => x?.name) ?? [];
  const inheritedMustNotHaves =
    inheritedReplacementCriteria?.mustNotHave?.map(x => x?.name) ?? [];
  const deduppedMustNotHaves = [
    ...new Set(mustNotHaves.concat(inheritedMustNotHaves)),
  ];

  const preferToHaves =
    replacementCriteria?.preferToHave?.map(x => x?.name) ?? [];
  const inheritedPreferToHaves =
    inheritedReplacementCriteria?.preferToHave?.map(x => x?.name) ?? [];
  const deduppedPreferToHaves = [
    ...new Set(preferToHaves.concat(inheritedPreferToHaves)),
  ];

  const preferToNotHaves =
    replacementCriteria?.preferToNotHave?.map(x => x?.name) ?? [];
  const inheritedPreferToNotHaves =
    inheritedReplacementCriteria?.preferToNotHave?.map(x => x?.name) ?? [];
  const deduppedPreferToNotHaves = [
    ...new Set(preferToNotHaves.concat(inheritedPreferToNotHaves)),
  ];

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Replacement criteria")}
          actions={[
            {
              text: t("Edit"),
              visible: showEditButton,
              execute: () => {
                const editSettingsUrl = PeopleReplacementCriteriaEditRoute.generate(
                  params
                );
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.EmployeeSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={8}>
            {props.disabled && (
              <Grid item>
                <Typography variant="h6">
                  {t("Does not apply to positions that do not require subs.")}
                </Typography>
              </Grid>
            )}
            {(!props.disabled ||
              deduppedMustHaves.length > 0 ||
              deduppedPreferToHaves.length > 0 ||
              deduppedMustNotHaves.length > 0 ||
              deduppedPreferToNotHaves.length > 0) && (
              <>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Substitutes must have")}
                  </Typography>
                  {deduppedMustHaves.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    deduppedMustHaves.map((n, i) => <div key={i}>{n}</div>)
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Prefer that substitutes have")}
                  </Typography>
                  {deduppedPreferToHaves.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    deduppedPreferToHaves.map((n, i) => <div key={i}>{n}</div>)
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Substitutes must not have")}
                  </Typography>
                  {deduppedMustNotHaves.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    deduppedMustNotHaves.map((n, i) => <div key={i}>{n}</div>)
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Prefer that substitutes not have")}
                  </Typography>
                  {deduppedPreferToNotHaves.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    deduppedPreferToNotHaves.map((n, i) => (
                      <div key={i}>{n}</div>
                    ))
                  )}
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
