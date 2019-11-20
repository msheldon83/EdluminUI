import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { NeedsReplacement } from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  positionName: string | null | undefined;
  needsReplacement: Maybe<NeedsReplacement>;
  hoursPerFullWorkDay: number | null | undefined;
  contractName: string | null | undefined;
  scheduleNames: Array<string | undefined>;
};

export const Position: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Position")}
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
              <Typography variant="h6">{t("Position")}</Typography>
              <div>{props.positionName ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Location")}</Typography>
              <div></div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Needs replacement")}</Typography>
              <div>{props.needsReplacement ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Schedule")}</Typography>
              <div>
                {(props.scheduleNames.length > 0 &&
                  props.scheduleNames.join(",")) ??
                  t("Not available")}
              </div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Contract")}</Typography>
              <div>{props.contractName ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Hours in full day")}</Typography>
              <div>{props.hoursPerFullWorkDay ?? t("Not available")}</div>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};