import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";

type Props = {};

export const CreateAbsence: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <PageTitle title={t("Create absence")} />
      <Section>
        <Grid container>
          <Grid item md={4}>
            <Typography className={classes.subtitle}>{t("Time")}</Typography>
          </Grid>
          <Grid item md={8}>
            <Typography className={classes.subtitle}>{t("Reason")}</Typography>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subtitle: {
    fontSize: theme.typography.pxToRem(24),
  },
}));
