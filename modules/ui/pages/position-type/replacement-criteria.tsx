import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { Maybe, Endorsement, PermissionEnum } from "graphql/server-types.gen";
import {
  PositionTypeViewRoute,
  ReplacementCriteriaEditRoute,
} from "ui/routes/position-type";

type Props = {
  disabled: boolean;
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
  const params = useRouteParams(PositionTypeViewRoute);

  const replacementCriteria = props.replacementCriteria;

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Replacement criteria")}
          actions={[
            {
              text: t("Edit"),
              visible: !props.disabled && !props.editing,
              execute: () => {
                const editSettingsUrl = ReplacementCriteriaEditRoute.generate(
                  params
                );
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.FinanceSettingsSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          {props.disabled && (
            <Grid container item spacing={2} xs={8}>
              <Grid item>
                <Typography variant="h6">
                  {t("Does not apply to positions that do not require subs.")}
                </Typography>
              </Grid>
            </Grid>
          )}
          {(!props.disabled ||
            (replacementCriteria?.mustHave?.length ?? 0) > 0 ||
            (replacementCriteria?.preferToHave?.length ?? 0) > 0 ||
            (replacementCriteria?.mustNotHave?.length ?? 0) > 0 ||
            (replacementCriteria?.preferToNotHave?.length ?? 0) > 0) && (
            <>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">
                  {t("Substitutes must have")}
                </Typography>
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
                  {t("Prefer that subsitutes not have")}
                </Typography>
                {replacementCriteria?.preferToNotHave?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  replacementCriteria?.preferToNotHave?.map((n, i) => (
                    <div key={i}>{n?.name}</div>
                  ))
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Section>
    </>
  );
};
