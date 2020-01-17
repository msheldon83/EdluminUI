import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { PageHeader } from "ui/components/page-header";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  label: string;
  minimallyQualified: number;
  highlyQualified: number;
  remove?: void;
};

export const Qualified: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Grid container item xs={6} spacing={2} className={classes.rightPadding}>
        <Grid item xs={12}>
          <Section>
            <SectionHeader title={t(props.label)} />
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  rightPadding: {
    paddingRight: theme.spacing(3),
  },
}));
