import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
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

  const minimallyQualified =
    props.minimallyQualified === undefined
      ? t("Not Defined")
      : props.minimallyQualified.toString();

  const highlyQualified =
    props.highlyQualified === undefined
      ? t("Not Defined")
      : props.highlyQualified.toString();

  return (
    <>
      <Grid item xs={12}>
        <Section>
          <Grid container>
            <Grid item xs={6}>
              <SectionHeader
                title={minimallyQualified}
                className={classes.bottomMargin}
              />
              <div>{t("minimally qualified substitutes")}</div>
            </Grid>
            <Grid item xs={6}>
              <SectionHeader
                title={highlyQualified}
                className={classes.bottomMargin}
              />
              <div>{t("highly qualified substitutes")}</div>
            </Grid>
          </Grid>
        </Section>
      </Grid>
    </>
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
