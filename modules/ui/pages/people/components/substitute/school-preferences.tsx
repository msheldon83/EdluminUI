import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Typography, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { PersonalPreference } from "graphql/server-types.gen";

type Props = {
  subSchoolPreferences?: any[];
};

export const SubSchoolPreferences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const favorite = props?.subSchoolPreferences
    ? props?.subSchoolPreferences?.filter(
        e => e.preferenceId == PersonalPreference.Favorite
      )
    : [];

  const hidden = props?.subSchoolPreferences
    ? props?.subSchoolPreferences?.filter(
        e => e.preferenceId == PersonalPreference.Hidden
      )
    : [];

  return (
    <Section>
      <SectionHeader title={t("School preferences")} />
      <Grid container spacing={2}>
        <Grid container item spacing={2} xs={8}>
          {props.subSchoolPreferences?.length === 0 ? (
            <Grid item xs={12} sm={6} lg={6}>
              <div>{t("Not defined")}</div>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Favorite")}</Typography>
                {favorite?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  favorite?.map((n, i) => <div key={i}>{n.location.name}</div>)
                )}
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Hidden")}</Typography>
                {hidden?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  hidden?.map((n, i) => <div key={i}>{n.location.name}</div>)
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({}));
