import * as React from "react";
import { Grid, makeStyles, CircularProgress } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  minimallyQualified: number | undefined;
  highlyQualified: number | undefined;
};

export const Qualified: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { minimallyQualified, highlyQualified } = props;

  return (
    <Grid item xs={12}>
      <Section>
        <Grid container>
          <Grid item xs={6}>
            {minimallyQualified !== undefined ? (
              <SectionHeader
                title={minimallyQualified.toString()}
                className={classes.bottomMargin}
              />
            ) : (
              <CircularProgress size={28} />
            )}

            <div>{t("minimally qualified substitutes")}</div>
          </Grid>
          <Grid item xs={6}>
            {highlyQualified !== undefined ? (
              <SectionHeader
                title={highlyQualified.toString()}
                className={classes.bottomMargin}
              />
            ) : (
              <CircularProgress size={28} />
            )}
            <div>{t("highly qualified substitutes")}</div>
          </Grid>
        </Grid>
      </Section>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  rightPadding: {
    paddingRight: theme.spacing(3),
  },
  bottomMargin: {
    marginBottom: theme.spacing(-1),
  },
}));
