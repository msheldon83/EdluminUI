import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { PageHeader } from "ui/components/page-header";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  label: string;
  minimallyQualified: number | undefined;
  highlyQualified: number | undefined;
  remove?: void;
};

export const Qualified: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const minimallyQualified =
    props.minimallyQualified === undefined
      ? "Not Defined"
      : props.minimallyQualified.toString();

  const highlyQualified =
    props.highlyQualified === undefined
      ? "Not Defined"
      : props.highlyQualified.toString();

  return (
    <>
      <Grid item xs={12}>
        <Section>
          <Grid container>
            <Grid item xs={6}>
              <SectionHeader title={t(minimallyQualified)} />
              <div>minimally qualified substitutes</div>
            </Grid>
            <Grid item xs={6}>
              <SectionHeader title={t(highlyQualified)} />
              <div>highly qualified substitutes</div>
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
}));
