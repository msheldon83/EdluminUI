import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid, Tooltip, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { PersonalPreference } from "graphql/server-types.gen";
import { Schedule } from "@material-ui/icons";
import { GetDateInYesterdayTodayTomorrowFormat } from "ui/components/reports/daily-report/helpers";
import { parseISO } from "date-fns";

type Props = {
  subSchoolPreferences: {
    preferenceId: PersonalPreference;
    changedLocal?: string;
    location: { name: string };
  }[];
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
                  favorite?.map((n, i) => (
                    <Grid
                      container
                      key={i}
                      direction="row"
                      alignItems="center"
                      justify="flex-start"
                    >
                      <Tooltip
                        title={
                          n.changedLocal
                            ? `Added ${GetDateInYesterdayTodayTomorrowFormat(
                                parseISO(n.changedLocal),
                                "MMM d h:mm a"
                              )}`
                            : ""
                        }
                      >
                        <Schedule fontSize="inherit" />
                      </Tooltip>
                      <Typography>{n.location.name}</Typography>
                    </Grid>
                  ))
                )}
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6">{t("Hidden")}</Typography>
                {hidden?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  hidden?.map((n, i) => (
                    <Grid
                      container
                      key={i}
                      direction="row"
                      alignItems="center"
                      justify="flex-start"
                    >
                      <Tooltip
                        title={
                          n.changedLocal
                            ? GetDateInYesterdayTodayTomorrowFormat(
                                parseISO(n.changedLocal),
                                "MMM d h:mm a"
                              )
                            : ""
                        }
                      >
                        <Schedule fontSize="inherit" />
                      </Tooltip>
                      <Typography>{n.location.name}</Typography>
                    </Grid>
                  ))
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
