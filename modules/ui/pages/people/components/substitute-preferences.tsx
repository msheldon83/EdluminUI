import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
};

export const SubstitutePreferences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Subsitute preferences")}
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
              <Typography variant="h6">{t("Label")}</Typography>
              <div></div>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};